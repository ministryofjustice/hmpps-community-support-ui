import { GlobalContent } from '../../../assets/content/GlobalContent'

export type ReferralLayoutContent = Pick<
  GlobalContent['/referral/:id'],
  'subNavigationLabel' | 'actionPlanTabText' | 'actionPlanTabHref'
>
