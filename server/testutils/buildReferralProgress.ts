import { ReferralAppointmentHistory, ReferralProgress } from '@community-support-api'
import { randomUUID } from 'crypto'

type AppointmentEvent = {
  status: ReferralAppointmentHistory['status']
  dateTime?: string
}

type Appointment = {
  appointmentIcsId?: string
  event: AppointmentEvent
}

export default function buildReferralProgress(
  appointments: Appointment[],
  referralId: string = randomUUID(),
): ReferralProgress {
  return {
    referralId,
    fullName: 'Test User',
    appointments: appointments.map((appointment, appIndex) => {
      const appointmentIcsId = appointment.appointmentIcsId ?? `app-${appIndex + 1}`

      return {
        appointmentIcsId,
        type: 'ICS',
        dateTime: appointment.event.dateTime ?? `2026-03-${25 + appIndex}T${10 + appIndex}:00:00`,
        status: appointment.event.status,
      }
    }),
  }
}
