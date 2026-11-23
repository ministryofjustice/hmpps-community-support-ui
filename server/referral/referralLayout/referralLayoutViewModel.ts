import { GlobalContent } from '../../../assets/content/GlobalContent'

export type ReferralLayoutContent = Pick<GlobalContent['referral']['id']['page'], 'subNavigationLabel' | 'subNavItems'>
