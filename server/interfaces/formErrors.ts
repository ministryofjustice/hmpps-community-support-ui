import type { GovukFrontendErrorSummaryErrorListElement, GovukFrontendErrorMessage } from '@govuk-frontend'

export interface FormErrors {
  list: GovukFrontendErrorSummaryErrorListElement[]
  messages: Record<string, GovukFrontendErrorMessage>
}
