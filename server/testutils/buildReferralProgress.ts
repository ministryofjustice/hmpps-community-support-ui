import { ReferralProgress } from '@community-support-api'
import ReferralProgressFactory from './factories/ReferralProgress'

type AppointmentGroup = {
  appointmentId?: string
  events: Array<Partial<ReferralProgress>>
}

export default function buildAppointments(...groups: AppointmentGroup[]): ReferralProgress[] {
  return groups.flatMap((group, groupIndex) => {
    const appointmentId = group.appointmentId ?? `app-${groupIndex + 1}`

    return group.events.map((event, eventIndex) =>
      ReferralProgressFactory.build({
        appointmentId,
        appointmentDateTime: event.appointmentDateTime ?? `2026-03-${25 + groupIndex}-${10 + eventIndex}:00:00`,
        ...event,
      }),
    )
  })
}
