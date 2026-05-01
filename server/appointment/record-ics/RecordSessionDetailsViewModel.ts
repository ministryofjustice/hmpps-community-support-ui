import { GovukFrontendBackLink, GovukFrontendSummaryList } from '@govuk-frontend'
import { AppointmentDetailsContent } from './AppointmentDetailsModel'

export interface RecordSessionDetailsFormViewModel {
  wasPersonLate?: string
  lateReason?: string
  'sessionDuration-hours'?: string
  'sessionDuration-minutes'?: string
}

export interface RecordSessionDetailsFormData {
  wasPersonLate?: boolean
  lateReason?: string
  "sessionDuration-hours"?: number
  "sessionDuration-minutes"?: number
}

export type RecordSessionDetailsViewModel = {
  pageHeader: string
  firstName: string
  appointment: GovukFrontendSummaryList
  formData: RecordSessionDetailsFormData
  submitButtonText: string
  submitHref: string
  backLink: GovukFrontendBackLink
}

export type RecordSessionDetailsContent = {
  pageHeader: string
  appointmentDetails: AppointmentDetailsContent
  submitButtonText: string
  backLinkHref: string
}
