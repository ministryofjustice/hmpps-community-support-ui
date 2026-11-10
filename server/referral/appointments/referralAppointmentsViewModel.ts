import type { GovukFrontendTable, GovukFrontendButton } from '@govuk-frontend'
import type { MojAlert, MojSubNavigation } from '@moj-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export type ReferralAppointmentsViewModel = {
  pageHeader: string
  navBar: MojSubNavigation
  appointmentsTitle: string
  createAppointmentButton: GovukFrontendButton
  noAppointmentsMessage: string
  upcomingAppointmentsTable: GovukFrontendTable
  pastAppointmentsTable: GovukFrontendTable
  hasAppointments: boolean
  notificationBanner?: MojAlert
  upcomingAppointmentsTitle: string
  pastAppointmentsTitle: string
}

export type ReferralAppointmentsContent = GlobalContent['/referral/:id/appointments']
