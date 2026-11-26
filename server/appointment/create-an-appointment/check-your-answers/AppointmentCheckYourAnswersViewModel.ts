import { GovukFrontendBackLink, GovukFrontendSummaryList } from '@govuk-frontend'
import { GlobalContent } from '../../../../assets/content/GlobalContent'

export type AppointmentCheckYourAnswersViewModel = {
  pageTitle: string
  pageHeader: string
  submitHref: string
  submitButtonText: string
  backLink: GovukFrontendBackLink
  appointmentSummary: GovukFrontendSummaryList
  whatHappensNext?: { heading: string; text: string }
}

export type AppointmentCheckYourAnswersContent =
  GlobalContent['referral']['id']['createAnAppointment']['checkYourAnswers']
