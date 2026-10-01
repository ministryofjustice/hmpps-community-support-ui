import { GovukFrontendBackLink, GovukFrontendInsetText, GovukFrontendTable } from '@govuk-frontend'
import { GlobalContent } from '../../../../assets/content/GlobalContent'

export type ActionPlanViewActivitiesViewModel = {
  pageHeader: string
  backLink: GovukFrontendBackLink
  selectedNeedAndOutcomeInset: GovukFrontendInsetText
  activitiesTable: GovukFrontendTable
}

export type ActionPlanViewActivitiesContent = GlobalContent['/referral/:id/action-plan/activities']
