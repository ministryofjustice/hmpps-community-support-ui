import { GovukFrontendBackLink, GovukFrontendNotificationBanner, GovukFrontendTable } from '@govuk-frontend'
import { MojSubNavigation } from '@moj-frontend'

export type ReferralProgressViewModel = {
  pageHeader: string
  navBar: MojSubNavigation
  icsAppointmentTable: GovukFrontendTable
  actionLinkHref: string
  backLink: GovukFrontendBackLink
  notificationBanner?: GovukFrontendNotificationBanner
}

export interface ReferralProgressContent {
  pageHeader: string
  progressSubNavTitle: string
  subNavItems: SubNavItem[]
  progressActiveColumnHeaders: string[]
  progressInactiveColumnHeaders: string[]
}

export type SubNavItem = {
  id: string
  title: string
  href: string
}
