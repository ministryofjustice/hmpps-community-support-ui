import { ActionPlanSummaryDto } from '@community-support-api'
import { Response } from 'express'
import { GovukFrontendButton, GovukFrontendSummaryListCardActions, GovukFrontendSummaryListRow } from '@govuk-frontend'
import { formatDate } from 'date-fns'
import PresenterBase from '../../presenter/presenterBase'
import { ActionPlanContent, ActionPlanSummaryList, ActionPlanViewModel } from './actionPlanViewModel'
import { components } from '../../@types/communitySupportApi/imported'

export default class ActionPlanPresenter extends PresenterBase<ActionPlanViewModel, ActionPlanContent> {
  constructor(
    private readonly actionPlanSummary: ActionPlanSummaryDto,
    private readonly caseReference: string,
  ) {
    super()
  }

  protected buildViewModel(res: Response): ActionPlanViewModel {
    const content = this.buildStaticContent(res)
    const { firstName } = this.actionPlanSummary.personDetails

    const needsSummary = this.buildNeedsSummary(content, this.actionPlanSummary.needs)

    const hasNeeds = needsSummary.length > 0

    // TODO get updatedAt from actionPlanSummary
    const updatedAtText = hasNeeds ? this.formatUpdatedAtText(new Date()) : undefined

    const addAnotherOutcomeButton: GovukFrontendButton = hasNeeds
      ? {
          href: `/referral/${this.caseReference}/action-plan/select-a-need`,
          text: content.addAnotherOutcomeText,
          classes: 'govuk-button--secondary govuk-!-margin-right-2',
        }
      : undefined
    const submitActionPlanButton: GovukFrontendButton = hasNeeds ? { text: content.submitActionPlanText } : undefined
    const createButton: GovukFrontendButton = hasNeeds
      ? undefined
      : {
          href: `/referral/${this.caseReference}/action-plan/select-a-need`,
          text: content.createButtonText,
        }

    return {
      pageHeader: content.pageHeader,
      backLink: { href: `/progress/${this.caseReference}` },
      updatedAtText,
      needsSummary,
      addAnotherOutcomeButton,
      submitActionPlanButton,
      createButton,
      createLink: `/referral/${this.caseReference}/action-plan/create`,
      noActionPlanText: hasNeeds ? undefined : content.noActionPlanText.replace('{{ firstName }}', firstName),
    }
  }

  private buildNeedsSummary(
    content: ActionPlanContent,
    needs: components['schemas']['ActionPlanSummaryNeed'][],
  ): ActionPlanSummaryList[] {
    const summaryList: ActionPlanSummaryList[] = []
    needs.forEach((need, index) => {
      if (need.outcomes.length < 1) return []
      const outcome = need.outcomes[0]
      const moveUpButton: GovukFrontendButton =
        index > 0
          ? { text: content.moveOutcomeUpText, href: '#', classes: 'govuk-button--secondary govuk-!-margin-right-3' }
          : undefined
      const moveDownButton: GovukFrontendButton =
        index < needs.length - 1
          ? { text: content.moveOutcomeDownText, href: '#', classes: 'govuk-button--secondary' }
          : undefined
      return summaryList.push({
        card: {
          title: { text: need.label },
          actions: this.buildActions(content),
        },
        preText: `<b>${content.outcomePrefixText}</b>${outcome.label}`,
        rows: this.buildActivityList(content, outcome),
        moveUpButton: moveUpButton || undefined,
        moveDownButton: moveDownButton || undefined,
      })
    })
    return summaryList
  }

  private buildActivityList(
    content: ActionPlanContent,
    outcome: components['schemas']['ActionPlanSummaryOutcome'],
  ): GovukFrontendSummaryListRow[] {
    const activityList: GovukFrontendSummaryListRow[] = [
      {
        key: { text: content.whoWillDeliverHeaderText, classes: 'govuk-!-font-weight-bold' },
        value: { text: content.activityHeaderText, classes: 'govuk-!-font-weight-bold' },
      },
    ]
    outcome.activities.forEach(activity => {
      activityList.push({
        key: { text: activity.who },
        value: { text: activity.details },
      })
    })
    return activityList
  }

  private buildActions(content: ActionPlanContent): GovukFrontendSummaryListCardActions {
    return {
      items: [
        {
          href: '#',
          text: content.addOrChangeActivitiesText,
        },
        {
          href: '#',
          text: content.removeOutcomeText,
        },
      ],
    }
  }

  private formatUpdatedAtText(updatedAt: Date): string {
    return `Last updated ${formatDate(updatedAt, "dd MMMM yyyy 'at' h:mmaaa")}`
  }

  protected getTemplatePath(): string {
    return 'referral/actionPlan'
  }
}
