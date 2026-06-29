import { GovukFrontendBackLink, GovukFrontendSummaryList } from '@govuk-frontend'
import { MojSubNavigationItem } from '@moj-frontend'

export interface PersonalDetailsCard {
  heading: string
  nameLabel: string
  crnLabel: string
  prisonLabel: string
  dobLabel: string
  currentCircumstances: string
  disabilitiesLabel: string
}

export interface EqualityMonitoringCard {
  heading: string
  ethnicityLabel: string
  religionLabel: string
  sexLabel: string
  genderLabel: string
  sexualOrientationLabel: string
  transgenderLabel: string
}

export interface ContactDetailsCard {
  heading: string
  phoneNumberLabel: string
  mobileNumberLabel: string
  emailAddressLabel: string
  mainAddressLabel: string
}

export interface ConfirmPersonalDetailsContent {
  pageHeader: string
  pageSubHeader: string
  backLink: string
  defaultFieldValue: string
  personalDetailsCard: PersonalDetailsCard
  equalityMonitoringCard: EqualityMonitoringCard
  contactDetailsCard: ContactDetailsCard
}

export interface ConfirmPersonalDetailsViewModel {
  name: string
  personal: GovukFrontendSummaryList
  equality: GovukFrontendSummaryList
  contact: GovukFrontendSummaryList
  backLink: GovukFrontendBackLink
}
