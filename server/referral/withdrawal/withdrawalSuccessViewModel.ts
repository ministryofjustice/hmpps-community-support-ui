import { GovukFrontendPanel } from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export type WithdrawalSuccessContent = GlobalContent['/referral/:id/withdraw/success']

export interface WithdrawalSuccessViewModel {
  pageHeader: string
  introText: string
  backToCasesLink: string
  backToCasesLinkText: string
  panel: GovukFrontendPanel
}
