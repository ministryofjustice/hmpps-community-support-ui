import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendTextarea } from '@govuk-frontend'
import { GlobalContent } from '../../../../assets/content/GlobalContent'
import { GovukFrontendRadiosWithConditional } from '../../../@types/govukFrontend/derived'

export type ActionPlanServiceUserInvolvementViewModel = {
  pageTitle: string
  backLink: GovukFrontendBackLink
  submitButton: GovukFrontendButton
  userInvolvementInActionPlanRadioArgs: (whyNotInvolvedTextHtml: string) => GovukFrontendRadiosWithConditional
  whyNotInvolvedTextBoxArgs: GovukFrontendTextarea
}

export type ActionPlanServiceUserInvolvementContent = GlobalContent['/referral/:id/action-plan/person-involvement']
