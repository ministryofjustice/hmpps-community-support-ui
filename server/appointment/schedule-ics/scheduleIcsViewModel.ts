import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendRadios } from '@govuk-frontend'
import { MojDatePicker } from '@moj-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'
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
  meetAtTheGate?: string
}

export interface ScheduleIcsViewModel {
  pageHeader: string
  submitButton: GovukFrontendButton
  submitHref: string
  backLink: GovukFrontendBackLink
  dateInput: MojDatePicker
  timeInput: ComponentsTimeInput
  howWillTheSessionTakePlaceInput: GovukFrontendRadiosWithConditional
  meetAtTheGateInput?: GovukFrontendRadios
  howWasTheyInformedAboutTheSessionInput: GovukFrontendCheckboxesWithConditional | undefined
}

export type ScheduleIcsContent =
  | GlobalContent['/referral/:id/create-an-appointment/appointment-details']
  | GlobalContent['/referral/:id/appointment/schedule-ics']
