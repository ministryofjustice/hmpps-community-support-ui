import { MojSubNavigation } from '@moj-frontend'
import PresenterBase from '../../presenter/presenterBase'
import { ReferralLayoutContent } from './referralLayoutViewModel'

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

  getMojSubNavigationArgs(content: ReferralLayoutContent): MojSubNavigation {
    return {
      label: content.subNavigationLabel,
      items: [
        {
          href: `/referral/${this.referralId}/action-plan`,
          text: content.actionPlanTabText,
          active: this.activePage === ReferralNavigationValues.actionPlanTab,
        },
      ],
    }
  }
}
