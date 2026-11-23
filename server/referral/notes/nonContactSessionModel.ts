import { MojDatePicker } from '@moj-frontend'
import { GovukFrontendButton, GovukFrontendCharacterCount, GovukFrontendInput } from '@govuk-frontend'
import { ComponentsTimeInputNoMeridiem } from '../../@types/components'

export interface NonContactSessionModel {
  backLink: string
  pageHeader: string
  date: MojDatePicker
  time: ComponentsTimeInputNoMeridiem
  title: GovukFrontendInput
  activity: GovukFrontendCharacterCount
  submitButton: GovukFrontendButton
}
