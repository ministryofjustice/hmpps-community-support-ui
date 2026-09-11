import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendRadios } from '@govuk-frontend'
import { GlobalContent } from '../../../../assets/content/GlobalContent'

export type ActionPlanSelectOutcomeViewModel = {
  backLink: GovukFrontendBackLink
  selectOutcomeRadio: GovukFrontendRadios
  continueButton: GovukFrontendButton
  continueButtonLink: string
}

export type ActionPlanSelectOutcomeContent = GlobalContent['/referral/:id/action-plan/select-an-outcome']
