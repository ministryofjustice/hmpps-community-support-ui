import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendRadios, GovukFrontendTextarea } from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export interface ChangeIcsDetailsReasonFormData {
  requestedBy?: string
  reasonForChange?: string
}

export type ChangeIcsDetailsReasonViewModel = {
  pageHeader: string
  serviceName: string
  whoRequestedRadios: GovukFrontendRadios
  reasonTextarea: GovukFrontendTextarea
  submitButton: GovukFrontendButton
  submitHref: string
  backLink: GovukFrontendBackLink
  formData: ChangeIcsDetailsReasonFormData
}

export type WhoRequestedRadioItemsContent = WhoRequestedRadioContent['items']

export type WhoRequestedRadioContent = ChangeIcsDetailsReasonContent['whoRequestedRadio']

export type ReasonTextareaContent = ChangeIcsDetailsReasonContent['reasonTextarea']

export type ChangeIcsDetailsReasonContent = GlobalContent['/referral/:id/ics-change-details/reason']
