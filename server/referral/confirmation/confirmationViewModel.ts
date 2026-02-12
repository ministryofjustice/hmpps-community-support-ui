import { GovukFrontendPanel } from '@govuk-frontend'

export type ReferralConfirmationViewModel = {
  staticContent: ReferralConfirmationContent
  startAReferralLink: string
  panel: GovukFrontendPanel
}

export type ReferralConfirmationContent = {
  pageHeader: string
  referenceNumberIntro: string
}
