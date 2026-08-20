import { GovukFrontendBackLink } from '@govuk-frontend'
import { MojInterruptionCard } from '@moj-frontend'

export interface ConfirmAnAreaForReferralContent {
  backLink: string
  pageTitle: string
  pageCaption: string
  defaultFieldValue: string
  cardHeading: string
  deliveryPartnerLabel: string
  areaCoveredLabel: string
  pdusLabel: string
  buttonText: string
  selectDifferentAreaText: string
  selectDifferentAreaHref: string
}

export interface ConfirmAnAreaForReferralViewModel {
  backLink: GovukFrontendBackLink
  pageTitle: string
  heading: string
  pageCaption: string
  submitHref: string
  card: MojInterruptionCard
  deliveryPartnerLabel: string
  deliveryPartner: string
  areaCoveredLabel: string
  areaCovered: string
  pdusLabel: string
  pdus: string[]
}
