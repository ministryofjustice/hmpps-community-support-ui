import { MojSubNavigation } from '@moj-frontend'
import { ActionPlanContent } from './actionPlanViewModel'
import ReferralLayoutPresenter, { ReferralNavigationValues } from '../referralLayout/referralLayoutPresenter'

export enum ActionPlanNavigationValues {
  actionPlanTab = 'actionPlan',
  serviceDeliveryTab = 'serviceDelivery',
}

export default abstract class ActionPlanLayoutPresenter<ViewModel, Content> extends ReferralLayoutPresenter<
  ViewModel,
  Content
> {
  protected constructor(
    readonly activePage: ReferralNavigationValues,
    readonly activeTab: ActionPlanNavigationValues,
    readonly referralId: string,
  ) {
    super(activePage, referralId)
  }

  getHorizontalSubNavArgs(content: ActionPlanContent): MojSubNavigation {
    return {
      label: content.sideNavigationLabel,
      items: [
        {
          href: content.actionPlanSideTabHref.replace('{{ id }}', this.referralId),
          text: content.actionPlanSideTabText,
          active: this.activeTab === ActionPlanNavigationValues.actionPlanTab,
        },
        {
          href: content.serviceDetailsSideTabHref.replace('{{ id }}', this.referralId),
          text: content.serviceDetailsSideTabText,
          active: this.activeTab === ActionPlanNavigationValues.serviceDeliveryTab,
        },
      ],
    }
  }
}
