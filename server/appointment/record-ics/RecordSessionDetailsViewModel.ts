import { GovukFrontendSummaryList } from '@govuk-frontend'
import { FormContent } from './RecordSessionViewModel'
import { AppointmentDetailsContent } from './AppointmentDetailsModel'

export interface SessionDetailsDuration {
  hours: number
  minutes?: number
}

export interface RecordSessionDetailsFormData {
  wasPersonLate?: boolean
  lateReason?: string
  duration? : SessionDetailsDuration
}

export type RecordSessionDetailsViewModel = {
  pageHeader: string
  firstName: string
  appointment: GovukFrontendSummaryList
  submitButtonText: string
  submitHref: string
  backlinkHref: string
}

export type RecordSessionDetailsContent = {
  pageHeader: string
  appointmentDetails: AppointmentDetailsContent
  submitButtonText: string
  backLinkHref: string
}
