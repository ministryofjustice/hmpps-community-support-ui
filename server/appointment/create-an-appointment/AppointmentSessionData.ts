import type { AppointmentMethod } from './appointmentMethod'

export default interface AppointmentSessionData {
  appointmentType?: string
  date?: string
  startTime?: string
  method?: AppointmentMethod
  probationOfficeLocationId?: string
  location?: string
  meetAtTheGate?: boolean
  informedBy?: string[]
}
