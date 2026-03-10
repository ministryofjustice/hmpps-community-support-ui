import { GovukFrontendNotificationBanner, GovukFrontendSummaryList } from '@govuk-frontend'

export type ConfirmIcsViewModel = {
  pageHeader: string
  submitButtonText: string
  submitHref: string
  backlinkHref: string
  icsDetailsSummary: GovukFrontendSummaryList
  notificationBanner?: GovukFrontendNotificationBanner
}

export type ConfirmIcsContent = {
  pageHeader: string
  submitButtonText: string
}
