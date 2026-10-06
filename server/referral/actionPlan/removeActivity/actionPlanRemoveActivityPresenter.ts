import { Response } from 'express'
import PresenterBase from '../../../presenter/presenterBase'
import { ActionPlanRemoveActivityContent, ActionPlanRemoveActivityViewModel } from './actionPlanRemoveActivityViewModel'

type ActionPlanActivity = { activityProvider: string; activityDescription: string }

export default class ActionPlanRemoveActivityPresenter extends PresenterBase<
  ActionPlanRemoveActivityViewModel,
  ActionPlanRemoveActivityContent
> {
  constructor(
    private readonly caseReference: string,
    private readonly activityIndex: number,
    private readonly activity: ActionPlanActivity,
  ) {
    super()
  }

  protected buildViewModel(res: Response): ActionPlanRemoveActivityViewModel {
    const content = this.buildStaticContent(res)

    return {
      pageHeader: content.pageHeader,
      activitySummary: {
        rows: [
          { key: { text: content.activityProviderLabel }, value: { text: this.activity.activityProvider } },
          { key: { text: content.activityDetailsLabel }, value: { text: this.activity.activityDescription } },
        ],
      },
      removeButton: { text: content.removeButtonText, type: 'submit' },
      removeAction: `/referral/${this.caseReference}/action-plan/activities/${this.activityIndex}/remove`,
      cancelLink: {
        text: content.cancelLinkText,
        href: `/referral/${this.caseReference}/action-plan/activities`,
      },
    }
  }

  protected getTemplatePath(): string {
    return 'referral/actionPlanRemoveActivity'
  }
}
