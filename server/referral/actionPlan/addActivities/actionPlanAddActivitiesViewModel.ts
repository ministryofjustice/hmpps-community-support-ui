import { GovukFrontendBackLink, GovukFrontendButton } from '@govuk-frontend'
import { GlobalContent } from '../../../../assets/content/GlobalContent'

export type ActionPlanAddActivitiesViewModel = {
  pageHeader: string
  backLink: GovukFrontendBackLink
  addAnotherActivityButton: GovukFrontendButton
  addAnotherActivityLink: string
  saveAndContinueButton: GovukFrontendButton
  saveAndContinueLink: string
}

export type ActionPlanAddActivitiesContent = GlobalContent['/referral/:id/action-plan/add-activities']
