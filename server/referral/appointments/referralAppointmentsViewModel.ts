import type { GovukFrontendButton, GovukFrontendTable } from '@govuk-frontend'
import type { MojSubNavigation } from '@moj-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export type ReferralAppointmentsViewModel = {
  pageHeader: string
  navBar: MojSubNavigation
  appointmentsTitle: string
  createAppointmentButton: GovukFrontendButton
  noAppointmentsMessage: string
  appointmentsTable: GovukFrontendTable
  hasAppointments: boolean
  upcomingAppointmentsTitle: string
  pastAppointmentsTitle: string
}

export type ReferralAppointmentsContent = GlobalContent['/referral/:id/appointments']
