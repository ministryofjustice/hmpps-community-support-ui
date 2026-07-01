import { GovukFrontendBackLink, GovukFrontendSummaryList } from '@govuk-frontend'

export type CheckReferralInformationViewModel = {
  pageHeader: string
  submitButtonText: string
  backLink: GovukFrontendBackLink
  submitHref: string
  personalDetailsSummary: GovukFrontendSummaryList
  referralDetailsSummary: GovukFrontendSummaryList
}

export type CheckReferralInformationContent = {
  pageHeader: string
  submitButtonText: string
}
