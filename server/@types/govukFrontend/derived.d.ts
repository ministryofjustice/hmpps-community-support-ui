export type GovukFrontendRadiosItemWithConditional = GovukFrontendRadiosItem & {
  conditional?: { html: string }
}

export type GovukFrontendRadiosWithConditional = Omit<GovukFrontendRadios, 'items'> & {
  items: GovukFrontendRadiosItemWithConditional[]
}
