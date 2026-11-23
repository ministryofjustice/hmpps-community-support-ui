import { GovukFrontendBackLink, GovukFrontendSummaryList } from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export type IcsFeedbackCheckYourAnswersViewModel = {
  pageHeader: string
  submitButtonText: string
  submitHref: string
  backLink: GovukFrontendBackLink
  feedbackSummaries: Array<SummaryListWithTitle>
}

export type IcsFeedbackCheckYourAnswersContent = GlobalContent['icsFeedback']['id']['checkAnswers']

export type SummaryListWithTitle = GovukFrontendSummaryList & {
  summaryTitle: string
}

export type IcsFeedbackSummaryListContent = IcsFeedbackCheckYourAnswersContent['summaryLists'][number]

export type IcsFeedbackSummaryListContentRow = IcsFeedbackSummaryListContent['rows'][number]
