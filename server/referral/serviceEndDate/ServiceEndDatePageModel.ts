import { GovukFrontendBackLink } from '@govuk-frontend'

export interface ServiceEndDatePageContent {
  pageTitle: string
  pageHeader: string
  hint: string
  dateLabel: string
  dateHint?: string
  reasonLabel: string
  reasonHint: string
  backLink: string
  continueButton: string
}

export interface ServiceEndDateFormValues {
  day?: string
  month?: string
  year?: string
  reason?: string
}

export interface ServiceEndDatePageViewModel {
  pageTitle: string
  pageHeader: string
  hint: string
  dateLabel: string
  dateHint?: string
  reasonLabel: string
  reasonHint: string
  continueButton: string
  backLink: GovukFrontendBackLink
  formValues: ServiceEndDateFormValues
}
