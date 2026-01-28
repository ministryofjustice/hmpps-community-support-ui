import { GovukFrontendSummaryList } from '@govuk-frontend'

export type FoundPersonViewModel = {
  staticContent: FoundPersonContent
  personSummary: GovukFrontendSummaryList
}

export type FoundPersonContent = {
  pageHeader: string
  continueButtonText: string
  continueButtonLink: string
}
