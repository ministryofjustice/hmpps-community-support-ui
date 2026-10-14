import { GovukFrontendBackLink } from '@govuk-frontend'
import { MojInterruptionCard } from '@moj-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export type ConfirmAnAreaForReferralContent = GlobalContent['/referral/task-list/confirm-an-area-for-referral']

export interface ConfirmAnAreaForReferralViewModel {
  backLink: GovukFrontendBackLink
  pageTitle: string
  heading: string
  pageCaption: string
  submitHref: string
  card: MojInterruptionCard
  deliveryPartnerLabel: string
  deliveryPartner: string
  pdusLabel: string
  pdus: string[]
}
