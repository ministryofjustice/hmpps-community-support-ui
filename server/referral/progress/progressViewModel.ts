import { GovukFrontendNotificationBanner, GovukFrontendTable } from '@govuk-frontend'
import { MojSubNavigation } from '@moj-frontend'

export type ReferralProgressViewModel = {
  staticContent: ReferralProgressContent
  navBar: MojSubNavigation
  hasIcsAppointment: boolean
  icsAppointmentTable: GovukFrontendTable
  actionLinkHref: string
  backlinkHref: string
  notificationBanner?: GovukFrontendNotificationBanner
}

export type ReferralProgressContent = {
  pageHeader: string
  caseDetailsSubNavTitle: string
  progressSubNavTitle: string
  changeLogSubNavTitle: string
  subNavItems: Array<SubNavItem>
  progressActiveColumnHeaders: Array<string>
  progressInactiveColumnHeaders: Array<string>
}

export type SubNavItem = {
  id: string
  title: string
  href: string
}
