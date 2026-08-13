import { GovukFrontendBackLink } from '@govuk-frontend'

export interface ServiceEndDatePageContent {
  pageTitle: string
  pageHeader: string
  hint: string
  dateLabel: string
  reasonLabel: string
  reasonHint: string
  backLink: string
  continueButton: string
}

export interface ServiceEndDatePageViewModel {
  pageTitle: string
  pageHeader: string
  hint: string
  dateLabel: string
  reasonLabel: string
  reasonHint: string
  backLink: GovukFrontendBackLink
  targetServiceCompletionDate?: string
  targetServiceCompletionReason?: string
}
