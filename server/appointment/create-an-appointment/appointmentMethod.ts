import { SessionMethodRequest } from '@community-support-api'

const appointmentMethodConfig = {
  PHONE: { label: 'Phone call', location: false },
  VIDEO: { label: 'Video call', location: false },
  IN_PERSON: { label: 'In person', location: false },
  IN_PERSON_PROBATION_OFFICE: { label: 'In person (Probation office)', location: true },
  IN_PERSON_OTHER_LOCATION: { label: 'In person (Other location)', location: true },
  IN_PERSON_PRISON: { label: 'In person (Prison)', location: true },
} as const

export type AppointmentMethod = keyof typeof appointmentMethodConfig

export const appointmentMethodLabels: Record<AppointmentMethod, string> = Object.fromEntries(
  Object.entries(appointmentMethodConfig).map(([method, config]) => [method, config.label]),
) as Record<AppointmentMethod, string>

const legacyAppointmentMethodMap = {
  ByPhone: 'PHONE',
  ByVideo: 'VIDEO',
  InPerson: 'IN_PERSON',
  InProbationOffice: 'IN_PERSON_PROBATION_OFFICE',
  InSomewhereElse: 'IN_PERSON_OTHER_LOCATION',
  InPrison: 'IN_PERSON_PRISON',
} as const

const methodsWithLocationDetails = new Set<AppointmentMethod>([
  'IN_PERSON_PROBATION_OFFICE',
  'IN_PERSON_OTHER_LOCATION',
])

export const normaliseAppointmentMethod = (value?: string): AppointmentMethod | undefined => {
  if (!value) {
    return undefined
  }

  const normalised = value.trim()
  const legacyMethod = legacyAppointmentMethodMap[normalised as keyof typeof legacyAppointmentMethodMap]
  if (legacyMethod) {
    return legacyMethod
  }

  const canonicalMethod = normalised.toUpperCase().replace(/\s+/g, '_')
  return canonicalMethod in appointmentMethodConfig ? (canonicalMethod as AppointmentMethod) : undefined
}

export const isAppointmentMethod = (value?: string): value is AppointmentMethod =>
  value !== undefined && normaliseAppointmentMethod(value) !== undefined

export const getAppointmentMethodLabel = (method?: string): string => {
  const normalisedMethod = normaliseAppointmentMethod(method)
  return normalisedMethod ? appointmentMethodLabels[normalisedMethod] : method || ''
}

export const buildAppointmentSessionMethodRequest = (
  method: AppointmentMethod | undefined,
  additionalDetails = '',
): SessionMethodRequest => {
  if (!method) {
    return { type: 'PHONE' }
  }

  if (method === 'IN_PERSON_PRISON') {
    if (!additionalDetails.trim()) {
      throw new Error('A prison code is required to book a prison session')
    }
    return { type: method, prisonCode: additionalDetails }
  }

  if (methodsWithLocationDetails.has(method) || ((method === 'PHONE' || method === 'VIDEO') && additionalDetails)) {
    return { type: method, additionalDetails }
  }

  return { type: method }
}

export const appointmentMethodRequiresLocation = (method?: string): boolean => {
  const normalisedMethod = normaliseAppointmentMethod(method)
  return normalisedMethod ? appointmentMethodConfig[normalisedMethod].location : false
}
