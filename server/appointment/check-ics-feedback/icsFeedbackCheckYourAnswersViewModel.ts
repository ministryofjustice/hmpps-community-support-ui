import { GovukFrontendSummaryList } from '@govuk-frontend'

export type IcsFeedbackCheckYourAnswersViewModel = {
  pageHeader: string
  submitButtonText: string
  submitHref: string
  backlinkHref: string
  feedbackSummarys: Array<SummaryListWithTitle>
}

export type IcsFeedbackCheckYourAnswersContent = {
  pageHeader: string
  summaryLists: Array<IcsFeedbackSummaryListContent>
  submitButtonText: string
  submitHref: string
  backlinkHref: string
}

export type SummaryListWithTitle = GovukFrontendSummaryList & {
  summaryTitle: string
}

export type IcsFeedbackSummaryListContent = {
  summaryTitle: string
  rows: Array<IcsFeedbackSummaryListContentRow>
}

export type IcsFeedbackSummaryListContentRow = {
  text: string
  hint: string
}
