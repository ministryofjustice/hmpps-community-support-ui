export type SessionAppointmentType =
  'ICS' | 'CONTACT_SESSION' | 'PRE_RELEASE_SESSION' | 'POST_RELEASE_SESSION' | 'HANDOVER_SESSION'

export interface AppointmentTypeRules {
  probationOffice: boolean
  somewhereElse: boolean
  inPerson: boolean
  prison: boolean
  dateAfterReferral: boolean
  meetAtTheGate: boolean
  informed: boolean
}

const externalAppointmentTypeMap: Record<string, SessionAppointmentType> = {
  ics: 'ICS',
  contact: 'CONTACT_SESSION',
  'pre-release': 'PRE_RELEASE_SESSION',
  'post-release': 'POST_RELEASE_SESSION',
  handover: 'HANDOVER_SESSION',
}

export const appointmentTypeRules: Record<SessionAppointmentType, AppointmentTypeRules> = {
  ICS: {
    probationOffice: true,
    somewhereElse: true,
    inPerson: false,
    prison: false,
    dateAfterReferral: false,
    meetAtTheGate: false,
    informed: true,
  },
  CONTACT_SESSION: {
    probationOffice: true,
    somewhereElse: true,
    inPerson: false,
    prison: false,
    dateAfterReferral: true,
    meetAtTheGate: false,
    informed: true,
  },
  PRE_RELEASE_SESSION: {
    probationOffice: false,
    somewhereElse: false,
    inPerson: false,
    prison: true,
    dateAfterReferral: true,
    meetAtTheGate: false,
    informed: false,
  },
  POST_RELEASE_SESSION: {
    probationOffice: true,
    somewhereElse: true,
    inPerson: false,
    prison: false,
    dateAfterReferral: false,
    meetAtTheGate: true,
    informed: true,
  },
  HANDOVER_SESSION: {
    probationOffice: false,
    somewhereElse: false,
    inPerson: true,
    prison: false,
    dateAfterReferral: false,
    meetAtTheGate: false,
    informed: false,
  },
}

export const normaliseAppointmentTypeValue = (value: unknown): SessionAppointmentType | undefined => {
  if (typeof value !== 'string') {
    return undefined
  }

  const normalised = value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')

  const externalMatch = externalAppointmentTypeMap[normalised]
  if (externalMatch) {
    return externalMatch
  }

  const candidate = value
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_')

  const parsed = candidate === 'ICS' || candidate.endsWith('_SESSION') ? candidate : `${candidate}_SESSION`
  return parsed in appointmentTypeRules ? (parsed as SessionAppointmentType) : undefined
}

export const parseAppointmentType = (value: unknown): SessionAppointmentType | undefined => {
  return normaliseAppointmentTypeValue(value)
}
