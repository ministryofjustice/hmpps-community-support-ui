import type { GovukFrontendNotificationBanner, GovukFrontendTable } from '@govuk-frontend'
import type { MojSubNavigation } from '@moj-frontend'

export type ReferralAppointmentsViewModel = {
  pageHeader: string
  navBar: MojSubNavigation
  appointmentsTitle: string
  createAppointmentText: string
  createAppointmentHref: string
  noAppointmentsMessage: string
  appointmentsTable: GovukFrontendTable
  hasAppointments: boolean
  notificationBanner?: GovukFrontendNotificationBanner
}

export type ReferralAppointmentsContent = {
  pageHeader: string
  appointmentsTitle: string
  appointmentTypeColumnHeader: string
  dateTimeColumnHeader: string
  noAppointmentsMessage: string
  createAppointmentText: string
  appointmentCreatedSuccessfully: string
}
