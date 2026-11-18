import {
  GovukFrontendBackLink,
  GovukFrontendButton,
  GovukFrontendErrorMessage,
  GovukFrontendFieldset,
  GovukFrontendInput,
  GovukFrontendSummaryList,
} from '@govuk-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'
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

export type WasPersonLateRadioItemsContent = WasPersonLateRadioContent['items']

export type WasPersonLateRadioContent = RecordSessionDetailsContent['wasPersonLateRadio']

export type SessionDurationTimeInputFieldsetContent = SessionDurationTimeInputContent['fieldset']

export type SessionDurationTimeInputItemsContent = SessionDurationTimeInputContent['items']

export type SessionDurationTimeInputContent = RecordSessionDetailsContent['sessionDurationTimeInput']

export type RecordSessionDetailsContent = GlobalContent['/ics-feedback/:id/session-details']
