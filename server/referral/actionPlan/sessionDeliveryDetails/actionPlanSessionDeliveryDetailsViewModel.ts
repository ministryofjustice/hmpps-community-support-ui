import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendTextarea } from '@govuk-frontend'
import { GlobalContent } from '../../../../assets/content/GlobalContent'
import {
  GovukFrontendCheckboxesWithConditional,
  GovukFrontendRadiosWithConditional,
} from '../../../@types/govukFrontend/derived'


export type ActionPlanSessionDeliveryDetailsViewModel = {
  pageHeader: string
  backLink: GovukFrontendBackLink
  submitButton: GovukFrontendButton
  submitHref: string
  frequencyTextBoxArgs: GovukFrontendTextarea
  howRadioArgs:  (
    videoCallHtml: string,
    phoneCallHtml: string,
  ) => GovukFrontendRadiosWithConditional
  videoCallReasonTextBoxArgs: GovukFrontendTextarea
  phoneCallReasonTextBoxArgs: GovukFrontendTextarea
  formatCheckboxArgs: GovukFrontendCheckboxesWithConditional

}

export type ActionPlanSessionDeliveryDetailsContent =
  GlobalContent['/referral/:id/action-plan/session-delivery-details']
