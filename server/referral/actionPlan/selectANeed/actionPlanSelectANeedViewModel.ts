import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendRadios } from '@govuk-frontend'
import { GlobalContent } from '../../../../assets/content/GlobalContent'

export type ActionPlanSelectANeedViewModel = {
  pageHeader: string
  backLink: GovukFrontendBackLink
  identifiedNeedsDetailsTitle: string
  identifiedNeeds: { id: string; label: string }[]
  whichNeedsRadio: GovukFrontendRadios
  continueButton: GovukFrontendButton
  continueButtonLink: string
}

export type ActionPlanSelectANeedContent = GlobalContent['/referral/:id/action-plan/select-a-need']
