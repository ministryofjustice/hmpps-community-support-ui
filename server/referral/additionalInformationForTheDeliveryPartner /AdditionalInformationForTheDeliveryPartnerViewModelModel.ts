import { GovukFrontendBackLink, GovukFrontendButton } from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'
import { YesWithDetailOrNo } from '../../@types/govukFrontend/derived'

export type AdditionalInformationForTheDeliveryPartnerContent =
  GlobalContent['referral']['taskList']['additionalInformationForTheDeliveryPartner']

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
  radios: YesWithDetailOrNo
  button: GovukFrontendButton
}
