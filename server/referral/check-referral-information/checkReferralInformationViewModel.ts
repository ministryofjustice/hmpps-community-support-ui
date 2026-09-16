import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendSummaryList } from '@govuk-frontend'

export type CheckReferralInformationViewModel = {
  pageTitle: string
  pageHeader: string
  pageSubHeader: string
  personalDetailsHeader: string
  riskInformationHeader: string
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
  lastUpdatedLabel: string
}

export type EqualityMonitoringCard = {
  heading: string
  nationalityLabel: string
  ethnicityLabel: string
  religionOrBeliefLabel: string
  sexLabel: string
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

export type CheckReferralInformationContent = {
  pageTitle: string
  pageHeader: string
  pageSubHeader: string
  personalDetailsHeader: string
  notAvailable: string
  personalDetailsCard: PersonalDetailsCard
  equalityMonitoringCard: EqualityMonitoringCard
  riskInformationCard: RiskInformationCard
  referralDetailsHeader: string
  referralContactDetailsHeader: string
  submitButtonText: string
  backLink: string
}
