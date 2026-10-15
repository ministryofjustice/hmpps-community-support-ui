import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendRadios } from '@govuk-frontend'

export interface AppointmentTypeContent {
  pageTitle: string
  heading: string
  appointmentTypeLabel: string
  buttonText: string
}

export interface AppointmentTypeViewModel {
  pageTitle: string
  heading: string
  backLink: GovukFrontendBackLink
  radios: GovukFrontendRadios
  button: GovukFrontendButton
}
