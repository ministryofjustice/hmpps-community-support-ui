import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendInput } from '@govuk-frontend'

export interface ServiceDaysPageContent {
  pageTitle: string
  pageHeader: string
  hint?: string
  label?: string
  backLink: string
  continueButton: string
}

export interface ServiceDaysPageViewModel {
  pageTitle: string
  pageHeader: string
  hint?: string
  label?: string
  continueButton: string
  backLink: GovukFrontendBackLink
  button: GovukFrontendButton
  input: GovukFrontendInput,
  serviceDays?: number | string
}
