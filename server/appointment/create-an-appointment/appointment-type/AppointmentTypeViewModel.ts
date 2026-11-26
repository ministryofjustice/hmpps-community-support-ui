import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendRadios } from '@govuk-frontend'
import { GlobalContent } from '../../../../assets/content/GlobalContent'

export type AppointmentTypeContent = GlobalContent['referral']['id']['createAnAppointment']['appointmentType']

export interface AppointmentTypeViewModel {
  pageTitle: string
  heading?: string
  backLink: GovukFrontendBackLink
  radios: GovukFrontendRadios
  button: GovukFrontendButton
}
