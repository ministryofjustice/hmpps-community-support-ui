import {
  GovukFrontendBackLink,
  GovukFrontendButton,
  GovukFrontendInput,
  GovukFrontendInsetText,
  GovukFrontendTextarea,
} from '@govuk-frontend'
import { GlobalContent } from '../../../../assets/content/GlobalContent'

export type ActionPlanAddActivityViewModel = {
  pageHeader: string
  backLink: GovukFrontendBackLink
  selectedNeedAndOutcomeInset: GovukFrontendInsetText
  activityProviderInput: GovukFrontendInput
  activityDescriptionTextarea: GovukFrontendTextarea
  activityIndex?: number
  saveAndContinueButton: GovukFrontendButton
  saveAndContinueLink: string
}

export type ActionPlanAddActivityContent = GlobalContent['/referral/:id/action-plan/activities/add']
