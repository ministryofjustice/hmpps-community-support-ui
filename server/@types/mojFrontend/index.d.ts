import { GovukFrontendPagination } from '@govuk-frontend'

export type MojSubNavigation = {
  label: string
  items: Array<MojSubNavigationItem>
}

export type MojSubNavigationItem = {
  text: string
  href: string
  active?: boolean
}

export type MojPagination = GovukFrontendPagination & {
  results: {
    count: string
    from: string
    to: string
    text: string
  }
}

export interface MojDatePicker {
  id: string
  name: string
  value?: string
  formGroup?: GovukFrontendDateInputFormGroup
  label: GovukFrontendLabel
  hint?: GovukFrontendHint
  errorMessage?: GovukFrontendErrorMessage
  minDate?: string
  maxDate?: string
  excludedDates?: string
  excludedDays?: string
  weekStartDay?: string
}
