import { Response } from 'express'
import { GovukFrontendTable, GovukFrontendTableRow } from '@govuk-frontend'
import PresenterBase from '../../../presenter/presenterBase'
import { escapeHtml } from '../../../utils/utils'
import { ActionPlanViewActivitiesContent, ActionPlanViewActivitiesViewModel } from './actionPlanViewActivitiesViewModel'

type ActionPlanActivity = { activityProvider: string; activityDescription: string }

export default class ActionPlanViewActivitiesPresenter extends PresenterBase<
  ActionPlanViewActivitiesViewModel,
  ActionPlanViewActivitiesContent
> {
  constructor(
    private readonly caseReference: string,
    private readonly selectedNeedLabel: string,
    private readonly selectedOutcomeText: string,
    private readonly activities: ActionPlanActivity[],
  ) {
    super()
  }

  protected buildViewModel(res: Response): ActionPlanViewActivitiesViewModel {
    const content = this.buildStaticContent(res)

    return {
      pageHeader: content.pageHeader,
      backLink: { href: `/referral/${this.caseReference}/action-plan/select-an-outcome` },
      selectedNeedAndOutcomeInset: {
        html: `${content.areaOfNeedLabel}: <strong>${escapeHtml(this.selectedNeedLabel)}</strong><br>${content.outcomeLabel}: <strong>${escapeHtml(this.selectedOutcomeText)}</strong>`,
      },
      activitiesTable: this.buildActivitiesTable(content),
    }
  }

  private buildActivitiesTable(content: ActionPlanViewActivitiesContent): GovukFrontendTable {
    const rows: GovukFrontendTableRow[] = this.activities.map(activity => [
      { text: activity.activityProvider },
      { text: activity.activityDescription },
    ])

    return {
      head: [{ text: content.activityProviderHeading }, { text: content.activityDetailsHeading }],
      rows,
      attributes: { 'data-testid': 'action-plan-activities-table' },
    }
  }

  protected getTemplatePath(): string {
    return 'referral/actionPlanViewActivities'
  }
}
