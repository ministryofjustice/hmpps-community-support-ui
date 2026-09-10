import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendSummaryList } from '@govuk-frontend'
import { GovukFrontendRadiosWithConditional } from '../../@types/govukFrontend/derived'

export interface OffenceSentenceCardContent {
  heading: string
  offenceLabel: string
  offenceSubCategoryLabel: string
  outcomeLabel: string
  sentenceEndDateLabel: string
  expectedReleaseDateLabel: string
}

export interface OffenceSentencePageContent {
  pageTitle: string
  crnLabel: string
  dateOfBirthLabel: string
  pageSubHeader: string
  bodyText: string
  offenceSentenceCard: OffenceSentenceCardContent
  hasLicenceConditionsOrZonesLabel: string
  licenceConditionsOrZonesDetailsLabel: string
  notAvailableText: string
  yesOptionLabel: string
  noOptionLabel: string
  backLink: string
  submitHref: string
  continueButton: string
}

export interface OffenceSentencePageViewModel {
  pageTitle: string
  heading: string
  crnLabel: string
  crn: string
  dateOfBirthLabel: string
  dateOfBirth: string
  pageSubHeader: string
  bodyText: string
  backLink: GovukFrontendBackLink
  submitHref: string
  button: GovukFrontendButton
  offenceSentenceCardHeading: string
  offenceSentenceSummary: GovukFrontendSummaryList
  radios: GovukFrontendRadiosWithConditional
}
