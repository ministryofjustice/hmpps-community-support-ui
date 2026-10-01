import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendSummaryList } from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export type WithdrawalConfirmContent = GlobalContent['/referral/:id/withdraw/confirm']

export interface WithdrawalConfirmViewModel {
  pageHeader: string
  reasonSummary: GovukFrontendSummaryList
  warningText: string
  withdrawButton: GovukFrontendButton
  cancelHref: string
  cancelLinkText: string
  submitHref: string
  backLink: GovukFrontendBackLink
}
