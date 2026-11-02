export const INFORMED_BY_LABELS = {
  informedByPhone: 'Phone call',
  informedByTextMessage: 'Text message',
  informedByEmail: 'Email',
} as const

export const getInformedByLabel = (value?: string): string => {
  if (!value) {
    return ''
  }

  return INFORMED_BY_LABELS[value as keyof typeof INFORMED_BY_LABELS] ?? value
}
