import { AppointmentIcsResponse } from '@community-support-api'

type ApointmentDateAndTime = Pick<AppointmentIcsResponse, 'appointmentDate' | 'appointmentTime'>

const getAppointmentDateTime = ({ appointmentDate, appointmentTime }: ApointmentDateAndTime): Date => {
  const date = new Date(appointmentDate)
  date.setHours(appointmentTime.amPm === 'pm' ? appointmentTime.hour + 12 : appointmentTime.hour)
  date.setMinutes(appointmentTime.minute)
  return date
}
export default getAppointmentDateTime
