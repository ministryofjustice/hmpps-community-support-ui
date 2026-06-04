import { GovukFrontendBackLink, GovukFrontendButton } from '@govuk-frontend'
import { MojDatePicker } from '@moj-frontend'
import { ErrorMiddlewareErrors } from '../../@types/express'
import { ComponentsTimeInput } from '../../@types/components'
import {
  GovukFrontendCheckboxesWithConditional,
  GovukFrontendRadiosWithConditional,
} from '../../@types/govukFrontend/derived'

export interface SelectItem {
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
  informedMethods?: string[]
  otherMethodOfContact?: string
}

export interface ScheduleIcsViewModel {
  pageHeader: string
  submitButton: GovukFrontendButton
  submitHref: string
  backLink: GovukFrontendBackLink
  date: MojDatePicker
  time: ComponentsTimeInput
  how: GovukFrontendRadiosWithConditional
  informed: GovukFrontendCheckboxesWithConditional
}

export interface LabelAndHint {
  label: string
  hint: string
}

export interface ScheduleIcsContent {
  pageHeader: string
  date: LabelAndHint
  time: LabelAndHint
  submitButtonText: string
  submitHref: string
  backLink: string
}
