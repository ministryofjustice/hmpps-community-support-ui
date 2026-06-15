import { ReferralAppointmentHistory } from '@community-support-api'

export default function getLatestAppointments(
  appointments: ReferralAppointmentHistory[] = [],
): ReferralAppointmentHistory[] {
  const latest = new Map<string, ReferralAppointmentHistory>()

  for (const appointment of appointments) {
    const existing = latest.get(appointment.appointmentIcsId)

    if (!existing || appointment.dateTime > existing.dateTime) {
      latest.set(appointment.appointmentIcsId, appointment)
    }
  }

  return [...latest.values()].sort((a, b) => b.dateTime.localeCompare(a.dateTime))
}
