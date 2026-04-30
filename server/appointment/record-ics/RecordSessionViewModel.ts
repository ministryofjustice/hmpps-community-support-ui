export interface TextInputContent {
  id: string
  heading: string
  hint?: string
}

export interface FormOptionContent {
  label: string
  radios?: RadiosContent
  textInput?: TextInputContent
}

export interface RadiosContent {
  id: string
  heading: string
  hint?: string
  error: string
  options: FormOptionContent[]
}

export interface TimeInputContent {
  id: string
  heading: string
  hint?: string
}

export interface FormContent {
  radios?: RadiosContent
  timeInput?: TimeInputContent
  submitButtonText: string
}
