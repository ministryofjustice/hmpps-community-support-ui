import { GovukFrontendBackLink, GovukFrontendSummaryList } from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export type ViewSessionFeedbackContent = GlobalContent['/ics-feedback/:id/session/:id']

export type ViewSessionFeedbackViewModel = {
  pageTitle: string
  pageHeader: string
  backLink: GovukFrontendBackLink
  appointmentDetailsSummary: GovukFrontendSummaryList
  sessionDetailsSummary: GovukFrontendSummaryList
  recordSessionAttendanceSummary: GovukFrontendSummaryList
  sessionFeedbackSummary: GovukFrontendSummaryList
  issuesAndConcernsSummary: GovukFrontendSummaryList
  additionalSupportNeedsSummary: GovukFrontendSummaryList
  nextStepsSummary: GovukFrontendSummaryList
}
