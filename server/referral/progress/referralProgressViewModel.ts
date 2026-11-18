import { GovukFrontendBackLink, GovukFrontendNotificationBanner, GovukFrontendTable } from '@govuk-frontend'
import { MojSubNavigation } from '@moj-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export type ReferralProgressViewModel = {
  pageHeader: string
  navBar: MojSubNavigation
  icsAppointmentTable: GovukFrontendTable
  historySummary: string
  icsAppointmentHistoryTable: GovukFrontendTable
  actionPlanTitle: string
  actionPlanTable: GovukFrontendTable
  actionLinkHref: string
  backLink: GovukFrontendBackLink
  notificationBanner?: GovukFrontendNotificationBanner
}

export type ReferralProgressContent = GlobalContent['/progress/:id']
