import { GovukFrontendBackLink, GovukFrontendButton } from '@govuk-frontend'
import { GovukFrontendRadiosWithConditional } from '../../@types/govukFrontend/derived'

export interface AdditionalInformationForTheDeliveryPartnerContent {
  pageHeader: string
  yesOptionLabel: string
  yesCoditional: string
  noOptionLabel: string
  button: string
  backlink: string
}
export interface AdditionalInformationForTheDeliveryPartnerViewModel {
  backLink: GovukFrontendBackLink
  radios: GovukFrontendRadiosWithConditional
  button: GovukFrontendButton
}
