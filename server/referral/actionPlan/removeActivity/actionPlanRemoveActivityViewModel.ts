import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendRadios } from '@govuk-frontend'
import { GlobalContent } from '../../../../assets/content/GlobalContent'

export type ActionPlanRemoveActivityViewModel = {
  pageHeader: string
  backLink: GovukFrontendBackLink
  removeActivityRadio: GovukFrontendRadios
  saveAndContinueButton: GovukFrontendButton
  formAction: string
}

export type ActionPlanRemoveActivityContent = GlobalContent['/referral/:id/action-plan/activities/remove']
