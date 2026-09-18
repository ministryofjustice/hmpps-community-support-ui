import { GlobalContent } from '../../../assets/content/GlobalContent'

export type WithdrawalAlreadyWithdrawnContent = GlobalContent['/referral/:id/withdraw/error']

export interface WithdrawalAlreadyWithdrawnViewModel {
  pageHeader: string
  errorMessage: string
  backToCasesLink: string
  backToCasesLinkText: string
}
