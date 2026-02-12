import { GovukFrontendSummaryList } from '@govuk-frontend'

export type CheckReferralInformationViewModel = {
  pageHeader: string
  submitButtonText: string
  submitHref: string
  personalDetailsSummary: GovukFrontendSummaryList
  referralDetailsSummary: GovukFrontendSummaryList
}

export type CheckReferralInformationContent = {
  pageHeader: string
  submitButtonText: string
}
