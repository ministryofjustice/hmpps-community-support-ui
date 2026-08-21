import { GovukFrontendBackLink, GovukFrontendSummaryList } from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export type ActionPlanViewModel = {
  pageHeader: string
  backLink: GovukFrontendBackLink
  needsSummary: GovukFrontendSummaryList
}

export type ActionPlanContent = GlobalContent['/referral/:id/action-plan']
export type ActionPlanNeedsContent = GlobalContent['/referral/:id/action-plan/needs']
