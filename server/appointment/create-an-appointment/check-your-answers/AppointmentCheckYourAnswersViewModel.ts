import { GovukFrontendBackLink, GovukFrontendSummaryList } from '@govuk-frontend'

export type AppointmentCheckYourAnswersViewModel = {
  pageTitle: string
  pageHeader: string
  submitHref: string
  submitButtonText: string
  backLink: GovukFrontendBackLink
  appointmentSummary: GovukFrontendSummaryList
}

export type AppointmentCheckYourAnswersContent = {
  pageTitle: string
  pageHeader: string
  summaryTitle: string
  dateLabel: string
  startTimeLabel: string
  methodLabel: string
  locationLabel: string
  meetAtTheGateLabel: string
  informedLabel: string
  changeLinkText: string
  changeLinkVisualText: string
  changeLinkHref: string
  submitButtonText: string
  submitHref: string
  backLink: string
}
