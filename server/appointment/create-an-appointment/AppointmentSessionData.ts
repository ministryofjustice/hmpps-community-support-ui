import type { SessionMethodRequest } from '@community-support-api'
import type { AppointmentMethod } from './appointmentMethod'

export default interface AppointmentSessionData {
  appointmentType?: string
  date?: string
  startTime?: string
  method?: AppointmentMethod
  probationOfficeLocationId?: string
  prisonCode?: string
  prisonName?: string
  addressLines?: string[]
  address?: Pick<SessionMethodRequest, 'addressLine1' | 'addressLine2' | 'townOrCity' | 'county' | 'postcode'>
  reasonSessionNotInPerson?: string
  meetAtTheGate?: boolean
  informedBy?: string[]
}
