import { GlobalContent } from '../../../assets/content/GlobalContent'

export type WithdrawalServiceErrorContent = GlobalContent['/referral/:id/withdraw/service-error']

export interface WithdrawalServiceErrorViewModel {
  pageHeader: string
  message: string
  goToCaseListLink: string
  goToCaseListButtonText: string
}
