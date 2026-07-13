import { GovukFrontendBackLink, GovukFrontendButton } from '@govuk-frontend'
import { GovukFrontendRadiosWithConditional } from '../../@types/govukFrontend/derived'

export interface NeedsAnInterpreterContent {
  pageHeader: string
  radioHeader: string
  yesOptionLabel: string
  yesCoditional: string
  noOptionLabel: string
  button: string
  backlink: string
  url: string
}
export interface NeedsAnInterpreterViewModel {
  backLink: GovukFrontendBackLink
  heading: string
  radios: GovukFrontendRadiosWithConditional
  button: GovukFrontendButton
  postHref: string
}
export interface NeedsAnInterpreterDataModel {
  firstName: string
  middleNames?: string
  lastName: string
}
