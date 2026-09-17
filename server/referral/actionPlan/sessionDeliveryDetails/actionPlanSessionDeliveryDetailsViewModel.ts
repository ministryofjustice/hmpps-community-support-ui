import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendTextarea } from '@govuk-frontend'
import { GlobalContent } from '../../../../assets/content/GlobalContent'
import {
  GovukFrontendCheckboxesWithConditional,
  GovukFrontendRadiosWithConditional,
} from '../../../@types/govukFrontend/derived'

export type ActionPlanSessionDeliveryDetailsQuestionViewModel = {
  id: string
  textarea?: GovukFrontendTextarea
  radios?: GovukFrontendRadiosWithConditional
  checkboxes?: GovukFrontendCheckboxesWithConditional
}

export type ActionPlanSessionDeliveryDetailsViewModel = {
  pageHeader: string
  backLink: GovukFrontendBackLink
  questions: ActionPlanSessionDeliveryDetailsQuestionViewModel[]
  submitButton: GovukFrontendButton
  submitHref: string
}

export type ActionPlanSessionDeliveryDetailsContent =
  GlobalContent['/referral/:id/action-plan/session-delivery-details']
