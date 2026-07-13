import {
  GovukFrontendBackLink,
  GovukFrontendButton,
  GovukFrontendSummaryList,
  GovukFrontendWarningText,
} from '@govuk-frontend'

export interface PersonalDetailsCard {
  heading: string
  nameLabel: string
  crnLabel: string
  prisonLabel: string
  dobLabel: string
  languageLabel: string
  circumstancesLabel: string
  disabilitiesLabel: string
}

export interface EqualityMonitoringCard {
  heading: string
  nationalityLabel: string
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
  warningText: string
  buttonText: string
  postHref: string
}

export interface ConfirmPersonalDetailsViewModel {
  backLink: GovukFrontendBackLink
  heading: string
  subheading: string
  personal: GovukFrontendSummaryList
  equality: GovukFrontendSummaryList
  contact: GovukFrontendSummaryList
  warning: GovukFrontendWarningText
  button: GovukFrontendButton
  postHref: string
}
