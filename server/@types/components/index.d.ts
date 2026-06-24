import {
  GovukFrontendErrorMessage,
  GovukFrontendFieldset,
  GovukFrontendHint,
  GovukFrontendInputFormGroup,
} from '@govuk-frontend'

export interface ComponenstsTimeInputItem {
  name: string
  value: string
  classes?: string
}

export interface ComponentsTimeMeridiem {
  label: string
  value: string
}

export interface ComponentsTimeInput {
  id: string
  namePrefix: string
  errorMessage: GovukFrontendErrorMessage
  hint: GovukFrontendHint
  items: ComponenstsTimeInputItem[]
  meridiemParams: ComponentsTimeMeridiem
  formGroup?: GovukFrontendInputFormGroup
  fieldset?: GovukFrontendFieldset
}
