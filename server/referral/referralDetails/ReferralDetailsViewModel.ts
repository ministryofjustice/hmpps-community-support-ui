import { MojSubNavigationItem } from '@moj-frontend'

export interface PersonalDetailsCard {
  heading: string
  nameLabel: string
  crnLabel: string
  dobLabel: string
  languageLabel: string
  disabilitiesLabel: string
}

export interface EqualityMonitoringCard {
  heading: string
  ethnicityLabel: string
  religionLabel: string
  sexLabel: string
}

export interface ContactDetailsCard {
  heading: string
  phoneNumberLabel: string
  mobileNumberLabel: string
  emailAddressLabel: string
  mainAddressLabel: string
}

export interface ReferralDetailsCard {
  heading: string
  referralDateLabel: string
  assignedToLabel: string
  assignedToDefaultValue: string
  link: string
  linkChange: string
  targetServiceCompletionDateLabel: string
  targetServiceCompletionDateReasonLabel: string
}

export interface ReferralDetailsAlertsContent {
  withdrawalCompletedTitle: string
  withdrawalAlreadyCompletedTitle: string
  withdrawnInformationTitle: string
}

export interface ReferralDetailsContent {
  pageHeader: string
  pageSubHeader: string
  backLink: string
  defaultFieldValue: string
  successBannerHeading: string
  personalDetailsCard: PersonalDetailsCard
  equalityMonitoringCard: EqualityMonitoringCard
  contactDetailsCard: ContactDetailsCard
  referralDetailsCard: ReferralDetailsCard
  subNavTitle: string
  subNavItems: MojSubNavigationItem[]
  // TODO - Remove once we have a decision on the entry point for withdrawing referrals
  withdrawReferralLinkText: string
  alerts: ReferralDetailsAlertsContent
}

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
