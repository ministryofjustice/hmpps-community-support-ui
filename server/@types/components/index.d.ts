import {
  GovukFrontendErrorMessage,
  GovukFrontendFieldset,
  GovukFrontendHint,
  GovukFrontendInputFormGroup,
} from '@govuk-frontend'

export interface ComponentsTimeInputItem {
  name: string
  label?: string
  value: string
  classes?: string
}

export interface ComponentsTimeMeridiem {
  label: string
  value: string
  classes?: string
}

export interface ComponentsTimeInput {
  id: string
  namePrefix: string
  errorMessage: GovukFrontendErrorMessage
  hint: GovukFrontendHint
  items: ComponentsTimeInputItem[]
  meridiemParams: ComponentsTimeMeridiem
  formGroup?: GovukFrontendInputFormGroup
  fieldset?: GovukFrontendFieldset
}

interface ComponentsTimeInputNoMeridiem {
  id: string
  errorMessages: GovukFrontendErrorMessage[]
  fieldset: GovukFrontendFieldset
  attributes: Record<string, unknown>
  namePrefix: string
  items: GovukFrontendInput[]
}
