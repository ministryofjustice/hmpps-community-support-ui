import { GlobalContent } from '../../../assets/content/GlobalContent'

export type PersonalDetailsCard = ReferralDetailsContent['personalDetailsCard']

export type EqualityMonitoringCard = ReferralDetailsContent['equalityMonitoringCard']

export type ContactDetailsCard = ReferralDetailsContent['contactDetailsCard']

export type ReferralDetailsCard = ReferralDetailsContent['referralDetailsCard']

export type ReferralDetailsAlertsContent = ReferralDetailsContent['alerts']

export type ReferralDetailsContent = GlobalContent['/referral-details/:id']

export type AssignmentSuccessBanner = {
  successBannerHeading: string
  successBannerMessage: string
}

export type ReferralDetailsAlertVariant = 'success' | 'information' | 'warning' | 'error'

export type ReferralDetailsAlert = {
  variant: ReferralDetailsAlertVariant
  title: string
  dismissible: boolean
}
