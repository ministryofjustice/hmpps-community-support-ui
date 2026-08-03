import { GovukFrontendBackLink, GovukFrontendButton } from '@govuk-frontend'

export interface RiskSummaryRowCard {
  heading: string
  changeLinkText: string
}

export interface RiskSummaryContent {
  pageSubHeader: string
  backLink: string
  crnLabel: string
  dateOfBirthLabel: string
  lastUpdatedLabel: string
  defaultFieldValue: string
  noConcernsText: string
  dontKnowText: string
  noAdditionalInformationText: string
  changeHref: string
  whoIsAtRiskCard: RiskSummaryRowCard
  natureOfRiskCard: RiskSummaryRowCard
  riskImminenceCard: RiskSummaryRowCard
  selfHarmCard: RiskSummaryRowCard
  suicideCard: RiskSummaryRowCard
  hostelSettingCard: RiskSummaryRowCard
  vulnerabilityCard: RiskSummaryRowCard
  additionalInformationCard: RiskSummaryRowCard
  buttonText: string
  postHref: string
}

export interface RiskSummaryRow {
  heading: string
  content: string
  changeLink: {
    href: string
    text: string
  }
}

export interface RiskSummaryViewModel {
  backLink: GovukFrontendBackLink
  heading: string
  subheading: string
  crnLabel: string
  crn: string
  dateOfBirthLabel: string
  dateOfBirth: string
  lastUpdatedLabel: string
  lastUpdated: string
  rows: RiskSummaryRow[]
  button: GovukFrontendButton
}
