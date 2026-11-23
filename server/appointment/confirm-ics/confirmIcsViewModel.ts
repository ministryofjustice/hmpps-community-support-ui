import { GovukFrontendBackLink, GovukFrontendNotificationBanner, GovukFrontendSummaryList } from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export type ConfirmIcsViewModel = {
  pageHeader: string
  submitButtonText: string
  submitHref: string
  backLink: GovukFrontendBackLink
  icsDetailsSummary: GovukFrontendSummaryList
  notificationBanner?: GovukFrontendNotificationBanner
  icsChangeReasonSummary?: GovukFrontendSummaryList
}

export type ConfirmIcsContent = GlobalContent['referral']['id']['appointment']['confirmIcs']
