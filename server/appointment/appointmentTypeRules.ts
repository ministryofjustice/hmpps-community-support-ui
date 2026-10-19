export type SessionAppointmentType =
  'CONTACT_SESSION' | 'PRE_RELEASE_SESSION' | 'POST_RELEASE_SESSION' | 'HANDOVER_SESSION'

export interface AppointmentTypeRules {
  probationOffice: boolean
  somewhereElse: boolean
  inPerson: boolean
  meetAtTheGate: boolean
  informed: boolean
}

export const appointmentTypeRules: Record<SessionAppointmentType, AppointmentTypeRules> = {
  CONTACT_SESSION: {
    probationOffice: true,
    somewhereElse: true,
    inPerson: false,
    meetAtTheGate: false,
    informed: true,
  },
  PRE_RELEASE_SESSION: {
    probationOffice: false,
    somewhereElse: true,
    inPerson: false,
    meetAtTheGate: false,
    informed: true,
  },
  POST_RELEASE_SESSION: {
    probationOffice: true,
    somewhereElse: true,
    inPerson: false,
    meetAtTheGate: true,
    informed: true,
  },
  HANDOVER_SESSION: {
    probationOffice: false,
    somewhereElse: false,
    inPerson: true,
    meetAtTheGate: false,
    informed: false,
  },
}

export const parseAppointmentType = (value: unknown): SessionAppointmentType | undefined => {
  if (typeof value !== 'string') {
    return undefined
  }
  const normalised = value
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_')
  const candidate = normalised.endsWith('_SESSION') ? normalised : `${normalised}_SESSION`
  return candidate in appointmentTypeRules ? (candidate as SessionAppointmentType) : undefined
}
