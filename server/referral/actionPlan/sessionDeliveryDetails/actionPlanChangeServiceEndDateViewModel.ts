import {
  GovukFrontendBackLink,
  GovukFrontendButton,
  GovukFrontendDateInput,
  GovukFrontendTextarea,
} from '@govuk-frontend'
import { GlobalContent } from '../../../../assets/content/GlobalContent'

export type ActionPlanChangeServiceEndDateViewModel = {
  pageTitle: string
  pageHeader: string
  backLink: GovukFrontendBackLink
  submitButton: GovukFrontendButton
  submitHref: string
  updateServiceEndDateDateInputArgs: GovukFrontendDateInput
  changeServiceEndDateReasonTextBoxArgs: GovukFrontendTextarea
}

export type ActionPlanChangeServiceEndDateContent = GlobalContent['/referral/:id/action-plan/update-service-end-date']
