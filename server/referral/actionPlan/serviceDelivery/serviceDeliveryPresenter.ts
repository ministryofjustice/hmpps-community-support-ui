import { Response } from 'express'
import { GovukFrontendButton, GovukFrontendSummaryList } from '@govuk-frontend'
import { ActionPlanSessionDeliveryDetailsResponse } from '@community-support-api'
import { format, isValid, parseISO } from 'date-fns'
import ActionPlanLayoutPresenter, { ActionPlanNavigationValues } from '../actionPlanLayoutPresenter'
import { ServiceDeliveryContent, ServiceDeliveryViewModel } from './serviceDeliveryViewModel'
import { ReferralNavigationValues } from '../../referralLayout/referralLayoutPresenter'
import { ActionPlanCheckYourAnswersDetails } from '../../../services/referralService'

type ServiceDeliveryQuestion = ActionPlanSessionDeliveryDetailsResponse['questions'][number]
export default class ServiceDeliveryPresenter extends ActionPlanLayoutPresenter<
  ServiceDeliveryViewModel,
  ServiceDeliveryContent
> {
  constructor(
    private readonly caseReference: string,
    private readonly serviceDeliveryDetails: ActionPlanCheckYourAnswersDetails,
  ) {
    super(ReferralNavigationValues.actionPlanTab, ActionPlanNavigationValues.serviceDeliveryTab, caseReference)
  }

  protected buildViewModel(res: Response): ServiceDeliveryViewModel {
    const content = this.buildStaticContent(res)

    const updatedAtText = ''

    const subNavigationArgs = this.getMojSubNavigationArgs(content)

    const horizontalSubNavArgs = this.getHorizontalSubNavArgs(content)

    const addAnotherOutcomeButton: GovukFrontendButton = {
      href: `/referral/${this.caseReference}/action-plan/select-a-need`,
      text: content.addAnotherOutcomeText,
      classes: 'govuk-button--secondary govuk-!-margin-right-2',
    }

    const serviceDeliverySummaryCard = this.buildServiceDeliverySummaryCard(content)
    const risksAndAdjustmentsSummaryCard = this.buildRisksAndAdjustmentsSummaryCard(content)
    const serviceEndDateSummaryCard = this.buildServiceEndDateSummaryCard(content)

    return {
      pageHeader: content.pageHeader,
      backLink: { href: `/progress/${this.caseReference}` },
      updatedAtText,
      addAnotherOutcomeButton,
      subNavigationArgs,
      horizontalSubNavArgs,
      serviceDeliverySummaryCard,
      risksAndAdjustmentsSummaryCard,
      serviceEndDateSummaryCard,
    }
  }

  protected getTemplatePath(): string {
    return 'referral/serviceDelivery'
  }

  private buildServiceDeliverySummaryCard(content: ServiceDeliveryContent): GovukFrontendSummaryList {
    const rows: GovukFrontendSummaryList['rows'] = []

    this.serviceDeliveryDetails.sessionDetails.questions.forEach(question => {
      rows.push(...this.buildRows(question))
    })

    return {
      card: {
        title: {
          text: content.serviceDeliveryCardTitle,
        },
      },
      rows,
    }
  }

  private buildRisksAndAdjustmentsSummaryCard(content: ServiceDeliveryContent): GovukFrontendSummaryList {
    const rows: GovukFrontendSummaryList['rows'] = []

    this.serviceDeliveryDetails.risksAndAdjustments.questions.forEach(question => {
      rows.push(...this.buildRows(question))
    })

    return {
      card: {
        title: {
          text: content.risksAndAdjustmentsCardTitle,
        },
      },
      rows,
    }
  }

  private buildServiceEndDateSummaryCard(content: ServiceDeliveryContent): GovukFrontendSummaryList {
    const rows: GovukFrontendSummaryList['rows'] = []

    this.serviceDeliveryDetails.serviceEndDate.questions.forEach(question => {
      rows.push(...this.buildRows(question))
    })

    return {
      card: {
        title: {
          text: content.serviceEndDateCardTitle,
        },
      },
      rows,
    }
  }

  private buildRows(question: ServiceDeliveryQuestion) {
    const mainValues: string[] = []
    const additionalRows: Array<{ key: { text: string }; value: { text: string } }> = []

    for (const response of question.savedResponses) {
      const responseText = this.getResponseText(question, response.value)
      if (responseText) {
        mainValues.push(responseText)
      }

      const choice = question.choices?.find(c => c.value === response.value)
      if (choice?.displayAdditionalDetailsOnSelect && response.additionalDetails) {
        additionalRows.push({
          key: { text: choice.additionalDetailsHint ?? choice.additionalDetailsLabel },
          value: { text: response.additionalDetails },
        })
      }
    }
    const mainValue = mainValues.filter(Boolean).join(', ')

    const rows = []
    if (mainValue) {
      rows.push({
        key: { text: question.label },
        value: { text: mainValue },
      })
    }

    return [...rows, ...additionalRows]
  }

  private getResponseText(question: ServiceDeliveryQuestion, value: string): string {
    const choiceLabel = question.choices?.find(choice => choice.value === value)?.label
    if (choiceLabel) {
      return choiceLabel
    }

    if (question.answerType === 'DATE') {
      const parsedDate = parseISO(value)
      return isValid(parsedDate) ? format(parsedDate, 'd MMMM yyyy') : value
    }

    return value
  }
}
