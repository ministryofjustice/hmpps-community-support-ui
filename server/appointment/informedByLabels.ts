export const INFORMED_BY_LABELS = {
  informedByPhone: 'Phone call',
  informedByTextMessage: 'Text message',
  informedByEmail: 'Email',
} as const

// Checkbox key -> value sent to the API
const API_VALUE_BY_KEY: Record<string, string> = {
  informedByPhone: 'Phone',
  informedByEmail: 'Email',
  informedByTextMessage: 'Text message',
}

// API value -> checkbox key, used to tick the boxes when an existing appointment is loaded
const KEY_BY_API_VALUE: Record<string, string> = {
  Phone: 'informedByPhone',
  Email: 'informedByEmail',
  'Text message': 'informedByTextMessage',
}

export const toApiInformedBy = (values: string[] = []): string[] =>
  values.map(value => API_VALUE_BY_KEY[value] ?? value)

export const fromApiInformedBy = (values: string[] = []): string[] =>
  values.map(value => KEY_BY_API_VALUE[value] ?? value)

export const getInformedByLabel = (value?: string): string => {
  if (!value) {
    return ''
  }

  return INFORMED_BY_LABELS[value as keyof typeof INFORMED_BY_LABELS] ?? value
}
