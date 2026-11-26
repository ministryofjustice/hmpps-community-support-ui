import { GovukFrontendBackLink, GovukFrontendSummaryList } from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export type IcsFeedbackCheckYourAnswersViewModel = {
  pageHeader: string
  submitButtonText: string
  submitHref: string
  backLink: GovukFrontendBackLink
  feedbackSummaries: Array<GovukFrontendSummaryList>
}

export type IcsFeedbackCheckYourAnswersContent = GlobalContent['icsFeedback']['id']['checkAnswers']

export type IcsFeedbackSummaryListContent = IcsFeedbackCheckYourAnswersContent['summaryLists'][number]
