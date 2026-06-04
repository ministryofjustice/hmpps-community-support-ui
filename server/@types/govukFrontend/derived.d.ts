import {
  GovukFrontendCheckboxes,
  GovukFrontendCheckboxesItem,
  GovukFrontendRadios,
  GovukFrontendRadiosItem,
} from '@govuk-frontend'

export type ConditionalInput = {
  html: string
}

export type WithConditional<T> = T & {
  conditional?: ConditionalInput
}

export type GovukFrontendRadiosWithConditional = Omit<GovukFrontendRadios, 'items'> & {
  items: WithConditional<GovukFrontendRadiosItem>[]
}

export type GovukFrontendCheckboxesWithConditional = Omit<GovukFrontendCheckboxes, 'items'> & {
  items: WithConditional<GovukFrontendCheckboxesItem>[]
}
