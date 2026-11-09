export type AppointmentTypeOption = {
  name: string
  value: string
}

export enum AppointmentTypeLabel {
  ICS = 'Initial contact session',
  CONTACT_SESSION = 'Contact session',
  PRE_RELEASE_SESSION = 'Pre-release session',
  POST_RELEASE_SESSION = 'Post-release session',
  HANDOVER_SESSION = 'Handover session',
}

export const defaultAppointmentTypeLabels: Record<string, string> = AppointmentTypeLabel

const appointmentTypeValueMap: Record<string, string> = {
  ics: 'ICS',
  contact: 'CONTACT_SESSION',
  pre_release: 'PRE_RELEASE_SESSION',
  post_release: 'POST_RELEASE_SESSION',
  handover: 'HANDOVER_SESSION',
}

const normaliseAppointmentTypeKey = (value?: string): string => {
  if (!value) {
    return ''
  }

  const normalised = value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
  return (
    appointmentTypeValueMap[normalised] ||
    value
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, '_')
  )
}

export const normaliseAppointmentTypeOptions = (
  appointmentTypes: AppointmentTypeOption[] = [],
): AppointmentTypeOption[] => {
  return [...appointmentTypes].map(option => ({
    ...option,
    name: defaultAppointmentTypeLabels[normaliseAppointmentTypeKey(option.value)] || option.name,
  }))
}

export const getAppointmentTypeLabel = (
  appointmentType?: string,
  appointmentTypes?: AppointmentTypeOption[],
): string => {
  if (!appointmentType) {
    return 'appointment'
  }

  const lookupValue = normaliseAppointmentTypeKey(appointmentType)
  const matchedType = appointmentTypes?.find(type => normaliseAppointmentTypeKey(type.value) === lookupValue)

  if (matchedType?.name) {
    return matchedType.name
  }

  return defaultAppointmentTypeLabels[lookupValue] || appointmentType
}
