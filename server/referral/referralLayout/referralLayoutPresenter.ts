import { MojSubNavigation } from '@moj-frontend'
import PresenterBase from '../../presenter/presenterBase'

export enum ReferralNavigationValues {
  actionPlanTab = 'actionPlan',
}

export default abstract class ReferralLayoutPresenter<ViewModel, Content> extends PresenterBase<ViewModel, Content> {
  protected constructor(
    readonly activePage: ReferralNavigationValues,
    readonly referralId: string,
  ) {
    super()
  }

  getMojSubNavigationArgs(): MojSubNavigation {
    return {
      label: 'Sub navigation',
      items: [
        {
          href: `/referral/${this.referralId}/action-plan`,
          text: 'Action plan',
          active: this.activePage === ReferralNavigationValues.actionPlanTab,
        },
      ],
    }
  }
}
