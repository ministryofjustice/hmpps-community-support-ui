import type { GovukFrontendTable } from '@govuk-frontend'
import type { MojSubNavigation } from '@moj-frontend'

export type ReferralAppointmentsViewModel = {
  pageHeader: string
  navBar: MojSubNavigation
  createAppointmentHref: string
  appointmentsTable: GovukFrontendTable
  hasAppointments: boolean
}

export type ReferralAppointmentsContent = {
  pageHeader: string
  subNavTitle: string
  subNavItems: { id: string; title: string }[]
  appointmentsTitle: string
  appointmentTypeColumnHeader: string
  dateTimeColumnHeader: string
  noAppointmentsMessage: string
  createAppointmentText: string
}
