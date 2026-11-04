import { ActionPlanSessionDeliveryDetailsResponse } from '@community-support-api'
import { Response } from 'express'
import { format, isValid, parseISO } from 'date-fns'
import PresenterBase from '../../../presenter/presenterBase'
import {
  ServiceDeliveryCheckYourAnswersContent,
  ServiceDeliveryCheckYourAnswersViewModel,
  ServiceDeliverySummary,
} from './serviceDeliveryCheckYourAnswersViewModel'

type ServiceDeliveryQuestion = ActionPlanSessionDeliveryDetailsResponse['questions'][number]

export type ServiceDeliveryCheckYourAnswersSections = [
  sessionDetails: ServiceDeliveryQuestion[],
  risksAndAdjustments: ServiceDeliveryQuestion[],
  serviceEndDate: ServiceDeliveryQuestion[],
  personInvolvement: ServiceDeliveryQuestion[],
]

export default class ServiceDeliveryCheckYourAnswersPresenter extends PresenterBase<
  ServiceDeliveryCheckYourAnswersViewModel,
  ServiceDeliveryCheckYourAnswersContent
> {
  constructor(
    private readonly sections: ServiceDeliveryCheckYourAnswersSections,
    private readonly caseReference: string,
  ) {
    super()
  }

  protected buildViewModel(res: Response): ServiceDeliveryCheckYourAnswersViewModel {
    const content = this.buildStaticContent(res)
    return {
      pageTitle: content.pageTitle,
      pageHeader: content.pageHeader,
      submitButton: { text: content.submitButtonText },
      submitHref: content.submitHref.replace('{{ id }}', this.caseReference),
      backLink: { href: content.backLink.replace('{{ id }}', this.caseReference) },
      summaryLists: this.buildSummaries(content),
    }
  }

  protected getTemplatePath(): string {
    return 'referral/actionPlanCheckYourAnswers'
  }

  private buildSummaries(content: ServiceDeliveryCheckYourAnswersContent): ServiceDeliverySummary[] {
    return content.summaryLists.map((summary, index) => {
      const questions = [...(this.sections[index] ?? [])].sort((left, right) => left.displayOrder - right.displayOrder)
      const rows = questions.flatMap(question => this.buildRows(question))

      return {
        summaryList: {
          card: {
            title: { text: summary.summaryTitle },
            actions: {
              items: [
                {
                  href: summary.changeHref.replace('{{ id }}', this.caseReference),
                  text: 'Change',
                },
              ],
            },
          },
          rows,
        },
      }
    })
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
