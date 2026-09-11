import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendSummaryList } from '@govuk-frontend'

export type CheckReferralInformationViewModel = {
  pageTitle: string
  pageHeader: string
  pageSubHeader: string
  personalDetailsHeader: string
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
  lastUpdatedLabel: string
}

export type EqualityMonitoringCard = {
  heading: string
  nationalityLabel: string
  ethnicityLabel: string
  religionOrBeliefLabel: string
  sexLabel: string
}

export type CheckReferralInformationContent = {
  pageTitle: string
  pageHeader: string
  pageSubHeader: string
  personalDetailsHeader: string
  notAvailable: string
  personalDetailsCard: PersonalDetailsCard
  equalityMonitoringCard: EqualityMonitoringCard
  referralDetailsHeader: string
  referralContactDetailsHeader: string
  submitButtonText: string
  backLink: string
}
