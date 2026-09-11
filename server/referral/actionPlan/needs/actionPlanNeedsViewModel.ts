import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendRadios } from '@govuk-frontend'
import { GlobalContent } from '../../../../assets/content/GlobalContent'

export type ActionPlanNeedsViewModel = {
  pageHeader: string
  backLink: GovukFrontendBackLink
  whichNeedsRadio: GovukFrontendRadios
  continueButton: GovukFrontendButton
  continueButtonLink: string
}

export type ActionPlanNeedsContent = GlobalContent['/referral/:id/action-plan/needs']
