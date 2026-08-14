import { GovukFrontendPanel } from '@govuk-frontend'

export type ReferralConfirmationViewModel = {
  staticContent: ReferralConfirmationContent
  startNewReferralLink: string
  startNewReferralButtonText: string
  backToCommunityHomeLink: string
  backToCommunityHomeLinkText: string
  panel: GovukFrontendPanel
}

export type ReferralConfirmationContent = {
  pageHeader: string
  referenceNumberIntro: string
  startNewReferralButtonText: string
  startNewReferralLink: string
  backToCommunityHomeLink: string
  backToCommunityHomeLinkText: string
}
