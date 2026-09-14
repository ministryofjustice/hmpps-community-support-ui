import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendSummaryList } from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export type ActionPlanViewModel = {
  pageHeader: string
  backLink: GovukFrontendBackLink
  needsSummary: GovukFrontendSummaryList
  createButton: GovukFrontendButton
  createLink: string
  noActionPlanText: string
}

export type ActionPlanContent = GlobalContent['/referral/:id/action-plan']
