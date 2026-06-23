import { GovukFrontendBackLink, GovukFrontendSummaryList } from '@govuk-frontend'

export type IcsFeedbackCheckYourAnswersViewModel = {
  pageHeader: string
  submitButtonText: string
  submitHref: string
  backLink: GovukFrontendBackLink
  feedbackSummarys: Array<SummaryListWithTitle>
}

export type IcsFeedbackCheckYourAnswersContent = {
  pageHeader: string
  summaryLists: Array<IcsFeedbackSummaryListContent>
  didNotHappenReasonLabels: {
    serviceProviderIssue: string
    referralCouldNotTakePart: string
    referralDidNotComply: string
  }
  submitButtonText: string
  submitHref: string
  didNotAttendbackLinkHref: string
  noSessionbackLinkHref: string
  attendedBackLinkHref: string
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
  changeHref: string
}
