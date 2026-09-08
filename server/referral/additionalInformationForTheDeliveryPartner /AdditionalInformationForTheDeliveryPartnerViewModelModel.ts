import { GovukFrontendBackLink, GovukFrontendButton } from '@govuk-frontend'
import { GovukFrontendRadiosWithConditional } from '../../@types/govukFrontend/derived'

export interface AdditionalInformationForTheDeliveryPartnerContent {
  pageTitle: string
  pageHeader: string
  detailsLink: string
  detailsHeader: string
  detailsItems: string[]
  yesOptionLabel: string
  yesConditional: string
  noOptionLabel: string
  button: string
  backlink: string
}

export interface Details {
  summary: string
  header: string
  items: string[]
}

export interface AdditionalInformationForTheDeliveryPartnerViewModel {
  pageTitle: string
  backLink: GovukFrontendBackLink
  heading: string
  details: Details
  radios: GovukFrontendRadiosWithConditional
  button: GovukFrontendButton
}
