import { Response } from 'express'
import { GovukFrontendSummaryListRow } from '@govuk-frontend'
import type { components } from '../../../@types/communitySupportApi/imported'
import PresenterBase from '../../../presenter/presenterBase'
import { ActionPlanRemoveOutcomeContent, ActionPlanRemoveOutcomeViewModel } from './actionPlanRemoveOutcomeViewModel'

type ActionPlanSummaryNeed = components['schemas']['ActionPlanSummaryNeed']

export default class ActionPlanRemoveOutcomePresenter extends PresenterBase<
  ActionPlanRemoveOutcomeViewModel,
  ActionPlanRemoveOutcomeContent
> {
  constructor(
    private readonly caseReference: string,
    private readonly firstName: string,
    private readonly need: ActionPlanSummaryNeed,
    private readonly outcomeAnswerId: string,
  ) {
    super()
  }

  protected buildViewModel(res: Response): ActionPlanRemoveOutcomeViewModel {
    const content = this.buildStaticContent(res)
    const outcome = this.need.outcomes.find(item => item.id === this.outcomeAnswerId)

    if (!outcome) {
      throw new Error(`Outcome '${this.outcomeAnswerId}' not found for need '${this.need.id}'`)
    }

    const activityRows: GovukFrontendSummaryListRow[] = [
      {
        key: { text: content.whoWillDeliverHeaderText, classes: 'govuk-!-font-weight-bold' },
        value: { text: content.activityHeaderText, classes: 'govuk-!-font-weight-bold' },
      },
      ...outcome.activities.map(activity => ({
        key: { text: activity.who },
        value: { text: activity.details },
      })),
    ]

    return {
      pageHeader: content.pageHeader.replace('{{ firstName }}', this.firstName),
      needSummary: {
        card: {
          title: { text: this.need.label },
          actions: { items: [] },
        },
        preText: `<b>${content.outcomePrefixText}</b>${outcome.label}`,
        rows: activityRows,
      },
      warningInset: { text: content.removeOutcomeWarningText },
      removeOutcomeButton: {
        text: content.removeOutcomeButtonText,
        classes: 'govuk-button--warning',
        type: 'submit',
      },
      removeAction: `/referral/${this.caseReference}/action-plan/remove-outcome`,
      needId: this.need.id,
      outcomeAnswerId: this.outcomeAnswerId,
      cancelLink: {
        text: content.cancelLinkText,
        href: `/referral/${this.caseReference}/action-plan`,
      },
    }
  }

  protected getTemplatePath(): string {
    return 'referral/actionPlanRemoveOutcome'
  }
}
