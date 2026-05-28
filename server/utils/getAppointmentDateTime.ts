import { AppointmentIcsResponse } from '@community-support-api'

type ApointmentDateAndTime = Pick<AppointmentIcsResponse, 'appointmentDate' | 'appointmentTime'>
const getHour = (hour: number, inAfternoon: boolean): number => {
  if (hour === 12) {
    return inAfternoon ? 12 : 0
  }
  return inAfternoon ? hour + 12 : hour
}

const getAppointmentDateTime = ({ appointmentDate, appointmentTime }: ApointmentDateAndTime): Date => {
  const date = new Date(appointmentDate)
  date.setUTCHours(getHour(appointmentTime.hour, appointmentTime.amPm === 'pm'))
  date.setUTCMinutes(appointmentTime.minute)
  return date
}
export default getAppointmentDateTime
