import { ReferralAppointmentHistory, ReferralProgress } from '@community-support-api'
import { randomUUID } from 'crypto'

type AppointmentEvent = {
  status: ReferralAppointmentHistory['status']
  dateTime?: string
}

type AppointmentGroup = {
  appointmentIcsId?: string
  events: AppointmentEvent[]
}

export default function buildReferralProgress(
  groups: AppointmentGroup[],
  referralId: string = randomUUID(),
): ReferralProgress {
  return {
    referralId,
    fullName: 'Test User',
    appointments: groups.flatMap((group, groupIndex) => {
      const appointmentIcsId = group.appointmentIcsId ?? `app-${groupIndex + 1}`

      return group.events.map((event, eventIndex) => ({
        appointmentIcsId,
        type: 'ICS',
        dateTime: event.dateTime ?? `2026-03-${25 + groupIndex}T${10 + eventIndex}:00:00`,
        status: event.status,
      }))
    }),
  }
}
