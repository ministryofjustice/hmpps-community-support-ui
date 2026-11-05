import type { AppointmentMethod } from './appointmentMethod'

export default interface AppointmentSessionData {
  appointmentType?: string
  date?: string
  startTime?: string
  method?: AppointmentMethod
  probationOfficeLocationId?: string
  addressLines?: string[]
  reasonSessionNotInPerson?: string
  meetAtTheGate?: boolean
  informedBy?: string[]
}
