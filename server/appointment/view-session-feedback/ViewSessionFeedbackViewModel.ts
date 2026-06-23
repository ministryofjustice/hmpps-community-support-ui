import { GovukFrontendBackLink, GovukFrontendSummaryList } from '@govuk-frontend'

export type ViewSessionFeedbackViewModel = {
  pageHeader: string
  backLink: GovukFrontendBackLink
  appointmentDetailsSummary: GovukFrontendSummaryList
  sessionDetailsSummary?: GovukFrontendSummaryList
  recordSessionAttendanceSummary?: GovukFrontendSummaryList
  sessionFeedbackSummary: GovukFrontendSummaryList
}
