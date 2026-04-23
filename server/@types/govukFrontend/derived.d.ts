export type ConditionalInput = {
  html: string
}

export type GovukFrontendRadiosItemWithConditional = GovukFrontendRadiosItem & {
  conditional?: ConditionalInput
}

export type GovukFrontendRadiosWithConditional = Omit<GovukFrontendRadios, 'items'> & {
  items: GovukFrontendRadiosItemWithConditional[]
}
