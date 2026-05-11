import {
  GovukFrontendBackLink,
  GovukFrontendButton,
  GovukFrontendErrorMessage,
  GovukFrontendFieldset,
  GovukFrontendInput,
  GovukFrontendSummaryList,
} from '@govuk-frontend'
import { AppointmentDetailsContent } from './AppointmentDetailsModel'
import { GovukFrontendRadiosWithConditional } from '../../@types/govukFrontend/derived'

export interface RecordSessionDetailsFormViewModel {
  wasPersonLate?: string
  lateReason?: string
  'sessionDuration-hours'?: string
  'sessionDuration-minutes'?: string
}

export interface RecordSessionDetailsFormData {
  wasPersonLate?: boolean
  lateReason?: string
  'sessionDuration-hours'?: number
  'sessionDuration-minutes'?: number
}

export interface TimeInput {
  id: string
  errorMessages: GovukFrontendErrorMessage[]
  fieldset: GovukFrontendFieldset
  attributes: Record<string, unknown>
  namePrefix: string
  items: GovukFrontendInput[]
}

export type RecordSessionDetailsViewModel = {
  pageHeader: string
  firstName: string
  appointment: GovukFrontendSummaryList
  wasPersonLateRadio: GovukFrontendRadiosWithConditional
  sessionDurationTimeInput: TimeInput
  submitButton: GovukFrontendButton
  submitHref: string
  backLink: GovukFrontendBackLink
  formData: RecordSessionDetailsFormData
}

export type WasPersonLateRadioItemsContent = {
  yesText: string
  noText: string
  lateReasonName: string
  lateReasonLabel: string
}

export type WasPersonLateRadioContent = {
  name: string
  title: string
  items: WasPersonLateRadioItemsContent
}

export type SessionDurationTimeInputFieldsetContent = {
  id: string
  text: string
}

export type SessionDurationTimeInputItemsContent = {
  hoursName: string
  hoursLabel: string
  minutesName: string
  minutesLabel: string
}

export type SessionDurationTimeInputContent = {
  id: string
  fieldset: SessionDurationTimeInputFieldsetContent
  items: SessionDurationTimeInputItemsContent
}

export type RecordSessionDetailsContent = {
  pageHeader: string
  appointmentDetails: AppointmentDetailsContent
  wasPersonLateRadio: WasPersonLateRadioContent
  sessionDurationTimeInput: SessionDurationTimeInputContent
  submitButtonText: string
  backLinkHref: string
}
