import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendRadios, GovukFrontendTextarea } from '@govuk-frontend'

export interface ChangeIcsDetailsReasonFormData {
  requestedBy?: string
  reasonForChange?: string
}

export type ChangeIcsDetailsReasonViewModel = {
  pageHeader: string
  serviceName: string
  whoRequestedRadios: GovukFrontendRadios
  reason: GovukFrontendTextarea
  submitButton: GovukFrontendButton
  submitHref: string
  backLink: GovukFrontendBackLink
  formData: ChangeIcsDetailsReasonFormData
}

export type WhoRequestedRadioItemsContent = {
  deliveryPartnerText: string
  probationPractitionerText: string
}

export type WhoRequestedRadioContent = {
  name: string
  title: string
  hint: string
  items: WhoRequestedRadioItemsContent
}

export type ReasonTextareaContent = {
  name: string
  label: string
}

export type ChangeIcsDetailsReasonContent = {
  pageHeader: string
  serviceName: string
  whoRequestedRadio: WhoRequestedRadioContent
  reasonTextarea: ReasonTextareaContent
  submitButtonText: string
  backLinkHref: string
}
