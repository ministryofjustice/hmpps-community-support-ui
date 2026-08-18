import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendRadios } from '@govuk-frontend'

export interface SelectAreaContent {
  buttonText: string
  areaLabel: string
  backLinkText: string
  backLinkHref: string
  heading: string
  pageCaption: string
}
export interface SelectAreaViewModel {
  heading: string
  pageCaption: string
  radioArgs: GovukFrontendRadios
  backLinkArgs: GovukFrontendBackLink
  buttonArgs: GovukFrontendButton
}
