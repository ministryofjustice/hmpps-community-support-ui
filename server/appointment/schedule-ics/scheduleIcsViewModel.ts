export type SelectItem = {
  value: string | number
  text: string
}

export type ScheduleIcsViewModel = {
  pageHeader: string
  submitButtonText: string
  submitHref: string
  backlinkHref: string
  probationOfficesSelectItems: SelectItem[]
  prisonsSelectItems: SelectItem[]
  isPersonInCommunity: boolean
  firstName: string
  errors: Record<string, { text: string }>
  errorList: Array<{ href: string; text: string }>
}

export type ScheduleIcsContent = {
  pageHeader: string
  submitButtonText: string
}
