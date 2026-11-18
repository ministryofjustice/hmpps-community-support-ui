import { GovukFrontendPanel } from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export type ReferralConfirmationViewModel = {
  staticContent: ReferralConfirmationContent
  startNewReferralLink: string
  startNewReferralButtonText: string
  backToCommunityHomeLink: string
  backToCommunityHomeLinkText: string
  panel: GovukFrontendPanel
}

export type ReferralConfirmationContent = GlobalContent['/referral/:id/confirmation']
