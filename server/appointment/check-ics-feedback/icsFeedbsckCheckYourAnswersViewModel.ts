import { GovukFrontendSummaryList } from '@govuk-frontend'

export type IcsFeedbackCheckYourAnswersViewModel = {
  pageHeader: string
  submitButtonText: string
  submitHref: string
  backlinkHref: string
  feedbackSummarys: GovukFrontendSummaryList[]
}

export type IcsFeedbackCheckYourAnswersContent = {
  pageHeader: string
  submitButtonText: string
  submitHref: string
  backlinkHref: string
}
