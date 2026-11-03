import type { GovukFrontendNotificationBanner, GovukFrontendTable, GovukFrontendButton } from '@govuk-frontend'
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
  notificationBanner?: GovukFrontendNotificationBanner
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
  appointmentCreatedSuccessfully: string
}
  notificationBanner?: GovukFrontendNotificationBanner
  upcomingAppointmentsTitle: string
  pastAppointmentsTitle: string
}

export type ReferralAppointmentsContent = GlobalContent['/referral/:id/appointments']
