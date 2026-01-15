import { GovukFrontendPanel } from '@govuk-frontend'

export type ReferralConfirmationViewModel = {
  title: string
  referenceNumberIntro: string
  referenceNumber: string
  startAReferralLink: string
  panel: GovukFrontendPanel
}
