export type AppointmentTypeOption = {
  name: string
  value: string
}

export const defaultAppointmentTypeLabels: Record<string, string> = {
  ICS: 'ICS',
  CONTACT_SESSION: 'Contact session',
  PRE_RELEASE_SESSION: 'Pre-release session',
  POST_RELEASE_SESSION: 'Post-release session',
  HANDOVER_SESSION: 'Handover session',
}

export const getAppointmentTypeLabel = (
  appointmentType?: string,
  appointmentTypes?: AppointmentTypeOption[],
): string => {
  if (!appointmentType) {
    return 'appointment'
  }

  const matchedType = appointmentTypes?.find(type => type.value === appointmentType)
  if (matchedType?.name) {
    return matchedType.name
  }

  return defaultAppointmentTypeLabels[appointmentType] || appointmentType
}
