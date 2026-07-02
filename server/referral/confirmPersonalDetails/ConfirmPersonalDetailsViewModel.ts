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
  buttonLink: string
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

export type WithUpdated<T> = {
  value: T
  updated: string // iso-date string
}

export interface Address {
  updated: string // iso-date string
  value: string
  type: string
  start: string // iso-date string
  notes: string
}
export interface PersonalDetails {
  firstName: string
  middleNames: string | null
  lastName: string
  crn: string
  prisonNumber: string[]
  dateOfBirth: string
  preferredLanguage: string
  currentCircumstances: WithUpdated<string>
  disabilities: WithUpdated<string[]>
}

export interface EqualityMonitoring {
  nationalities: string[]
  ethnicity: string
  religionOrBelief: string
  sex: string
  genderIdentity: string
  sexualOrientation: string
  transgender: string
}

export interface ContactDetails {
  phoneNumber: string
  mobileNumber: string
  emailAddress: string
  address: Address
}

export interface ConfirmPersonalDetailsDTO {
  personalDetails: PersonalDetails
  equalityMonitoring: EqualityMonitoring
  contactDetails: ContactDetails
}
