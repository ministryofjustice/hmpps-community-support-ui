import { GovukFrontendBackLink } from '@govuk-frontend'
import { ErrorMiddlewareErrors } from '../../@types/express'

export type SelectItem = {
  value: string | number
  text: string
}

export interface ScheduleFormData {
  sessionDate?: string
  'sessionTime-hour'?: string
  'sessionTime-minute'?: string
  'sessionTime-meridiem'?: string
  sessionTakePlace?: string
  ByPhone?: string
  ByVideo?: string
  InSomewhereElse?: string
  probationOffice?: string
  prison?: string
  addressLine1?: string
  addressLine2?: string
  addressTown?: string
  addressCounty?: string
  addressPostcode?: string
  informedMethod?: string[]
  otherMethodOfContact?: string
}

export type ScheduleIcsViewModel = {
  pageHeader: string
  submitButtonText: string
  submitHref: string
  backLink: GovukFrontendBackLink
  probationOfficesSelectItems: SelectItem[]
  prisonsSelectItems: SelectItem[]
  serviceName: string
  isPersonInCommunity: boolean
  firstName: string
  formData: ScheduleFormData
  errors: ErrorMiddlewareErrors
}

export type ScheduleIcsContent = {
  pageHeader: string
  submitButtonText: string
  submitHref: string
  backLink: string
}
