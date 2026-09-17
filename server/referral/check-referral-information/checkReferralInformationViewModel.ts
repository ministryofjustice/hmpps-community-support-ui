import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendSummaryList } from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export type CheckReferralInformationViewModel = {
  pageTitle: string
  pageHeader: string
  pageSubHeader: string
  personalDetailsHeader: string
  riskInformationHeader: string
  contactDetailsSummary?: GovukFrontendSummaryList
  riskInformationSummary: GovukFrontendSummaryList
  referralDetailsHeader: string
  referralContactDetailsHeader: string
  submitButton: GovukFrontendButton
  backLink: GovukFrontendBackLink
  submitHref: string
  personalDetailsSummary: GovukFrontendSummaryList
  equalityMonitoringSummary?: GovukFrontendSummaryList
  referralDetailsSummary: GovukFrontendSummaryList
}

export type PersonalDetailsCard = {
  heading: string
  nameLabel: string
  crnLabel: string
  prisonNumberLabel: string
  locationLabel: string
  dobLabel: string
  languageLabel: string
  currentCircumstancesLabel: string
  disabilitiesLabel: string
}

export type EqualityMonitoringCard = {
  heading: string
  nationalityLabel: string
  ethnicityLabel: string
  religionOrBeliefLabel: string
  sexLabel: string
}

export type ContactDetailsCard = {
  heading: string
  phoneNumberLabel: string
  mobileNumberLabel: string
  emailAddressLabel: string
  mainAddressLabel: string
  addressTypeLabel?: string
  addressStartDateLabel?: string
  addressNotesLabel?: string
}

export type RiskInformationCard = {
  heading: string
  whoIsAtRiskLabel: string
  riskNatureLabel: string
  riskCircumstancesLabel: string
  riskOfSelfHarmLabel: string
  riskOfSuicideLabel: string
  concernsCopingInApprovedPremisesLabel: string
  concernsVulnerabilityLabel: string
  additionalInformationLabel: string
  noAdditionalInformationText?: string
}

export type CheckReferralInformationContent = GlobalContent['/referral/check-referral-information']
