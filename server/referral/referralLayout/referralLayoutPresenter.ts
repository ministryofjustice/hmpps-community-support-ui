import { MojSubNavigation } from '@moj-frontend'
import PresenterBase from '../../presenter/presenterBase'
import { ReferralLayoutContent } from './referralLayoutViewModel'
import { globalContent } from '../../../assets/content/GlobalContent'

export enum ReferralNavigationValues {
  caseDetailsTab = 'caseDetails',
  progressTab = 'progress',
  actionPlanTab = 'actionPlan',
  appointmentsTab = 'appointments',
  changeLogTab = 'changeLog',
}

export default abstract class ReferralLayoutPresenter<ViewModel, Content> extends PresenterBase<ViewModel, Content> {
  protected constructor(
    readonly activePage: ReferralNavigationValues,
    readonly referralId: string,
  ) {
    super()
  }

  getMojSubNavigationArgs(
    content: ReferralLayoutContent = globalContent['/referral/:id'],
    isAssigned = true,
  ): MojSubNavigation {
    return {
      label: content.subNavigationLabel,
      items: content.subNavItems
        .filter(item => isAssigned || ['caseDetails', 'changeLog'].includes(item.id))
        .map(item => ({
          href: item.href.replace('{{ id }}', this.referralId),
          text: item.text,
          active: item.id === this.activePage,
        })),
    }
  }
}
