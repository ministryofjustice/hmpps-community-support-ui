import { GovukFrontendBackLink, GovukFrontendSummaryList } from '@govuk-frontend'

export type FoundPersonViewModel = {
  staticContent: FoundPersonContent
  personSummary: GovukFrontendSummaryList
  equalityMonitoring: GovukFrontendSummaryList
  additionalInformation: GovukFrontendSummaryList
  contactDetails: GovukFrontendSummaryList
  backLink: GovukFrontendBackLink
}

export type FoundPersonContent = {
  pageHeader: string
  continueButtonText: string
  continueButtonLink: string
  backLink: string
  enterDifferentIdentifierLinkText: string
  enterDifferentIdentifierLinkHref: string
}
