import { MojSubNavigation } from '@moj-frontend'
import { ActionPlanSideNavContent } from './actionPlanViewModel'
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

  getHorizontalSubNavArgs(content: ActionPlanSideNavContent): MojSubNavigation {
    return {
      label: content.sideNavigationLabel,
      items: [
        {
          href: content.actionPlanSideTabHref.replace('{{ id }}', this.referralId),
          text: content.actionPlanSideTabText,
          active: this.activeTab === ActionPlanNavigationValues.actionPlanTab,
        },
        {
          href: content.serviceDeliverySideTabHref.replace('{{ id }}', this.referralId),
          text: content.serviceDeliverySideTabText,
          active: this.activeTab === ActionPlanNavigationValues.serviceDeliveryTab,
        },
      ],
    }
  }
}
