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

export interface MojInterruptionCardAction {
  text: string
  href?: string
  style?: 'button' | 'link'
  attributes?: Record<string, string>
}

export interface MojInterruptionCard {
  heading: string
  primaryAction: MojInterruptionCardAction
  secondaryAction?: MojInterruptionCardAction
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
