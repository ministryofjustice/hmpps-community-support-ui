import { GovukFrontendBackLink, GovukFrontendSummaryList } from '@govuk-frontend'

export type AppointmentCheckYourAnswersViewModel = {
  pageTitle: string
  pageHeader: string
  submitHref: string
  submitButtonText: string
  backLink: GovukFrontendBackLink
  appointmentSummary: GovukFrontendSummaryList
  whatHappensNext?: { heading: string; text: string }
}

export type AppointmentCheckYourAnswersContent = {
  pageTitle: string
  pageHeader: string
  summaryTitle: string
  dateLabel: string
  startTimeLabel: string
  methodLabel: string
  probationOfficeLabel: string
  prisonLabel: string
  appointmentAddressLabel: string
  reasonSessionNotInPersonLabel: string
  meetAtTheGateLabel: string
  informedLabel: string
  whatHappensNextHeading: string
  retrospectiveAppointmentText: string
  changeLinkText: string
  changeLinkVisualText: string
  changeLinkHref: string
  continueButtonText: string
  submitButtonText: string
  submitHref: string
  backLink: string
}
