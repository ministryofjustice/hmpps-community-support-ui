import {
  GovukFrontendCheckboxes,
  GovukFrontendCheckboxesItem,
  GovukFrontendRadios,
  GovukFrontendRadiosItem,
  GovukFrontendTextarea,
} from '@govuk-frontend'

export type ConditionalInput = {
  html: string
}

export type WithConditional<T> = T & {
  conditional?: ConditionalInput
}

export type GovukFrontendRadiosItemWithConditional = WithConditional<GovukFrontendRadiosItem>

export type GovukFrontendRadiosWithConditional = Omit<GovukFrontendRadios, 'items'> & {
  items: WithConditional<GovukFrontendRadiosItem>[]
}

export type GovukFrontendCheckboxesWithConditional = Omit<GovukFrontendCheckboxes, 'items'> & {
  items: WithConditional<GovukFrontendCheckboxesItem>[]
}

export type YesWithDetailOrNoValue = { selected: 'yes'; details: string } | { selected: 'no' }

export interface YesWithDetailOrNo {
  dropDown: Omit<GovukFrontendTextarea, 'value'>
  main: Omit<GovukFrontendRadios, 'items'>
  value?: YesWithDetailOrNoValue
}
