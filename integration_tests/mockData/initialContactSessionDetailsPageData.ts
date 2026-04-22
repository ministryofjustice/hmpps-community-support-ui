import { AppointmentIcsResponse } from '@community-support-api'
import { format } from 'date-fns'
import { randomUUID } from 'node:crypto'

interface DateInfo {
  date: string
  hour: number
  minute: number
  amPm: string
}

const getDateInfo = (date: Date): DateInfo => ({
  date: format(date, 'Y-M-d'),
  hour: date.getHours(),
  minute: date.getMinutes(),
  amPm: format(date, 'aaa'),
})

class InitialContactSessionDetailsPageData {
  virtual(date: Date = new Date('2026-02-01T10:00:00Z')): AppointmentIcsResponse {
    const dateInfo = getDateInfo(date)
    return {
      appointmentIcsId: randomUUID(),
      appointmentId: randomUUID(),
      referralId: randomUUID(),
      appointmentType: 'ICS',
      appointmentDate: dateInfo.date,
      appointmentTime: {
        hour: dateInfo.hour,
        minute: dateInfo.minute,
        amPm: dateInfo.amPm,
      },
      appointmentStatus: 'COMPLETED',
      sessionMethod: {
        appointmentCategory: 'VIRTUAL',
        type: 'PHONE',
        whyNotInPersonReason: 'Welfare check call with Alice',
      },
      sessionCommunications: ['Phone', 'Text'],
      referralFirstName: 'Alice',
      referralLastName: 'Smith',
      createdAt: '2026-01-10T09:00:00Z',
    }
  }

  inPerson(date: Date = new Date('2026-02-01T09:30:00Z')): AppointmentIcsResponse {
    const dateInfo = getDateInfo(date)
    return {
      appointmentIcsId: randomUUID(),
      appointmentId: randomUUID(),
      referralId: randomUUID(),
      appointmentType: 'ICS',
      appointmentDate: dateInfo.date,
      appointmentTime: {
        hour: dateInfo.hour,
        minute: dateInfo.minute,
        amPm: dateInfo.amPm,
      },
      appointmentStatus: 'SCHEDULED',
      sessionMethod: {
        appointmentCategory: 'IN_PERSON',
        type: 'IN_PERSON_PROBATION_OFFICE',
        probationOfficeName: 'Office visit at probation office, Room 3',
      },
      sessionCommunications: ['Phone', 'Text'],
      referralFirstName: 'Carlos',
      referralLastName: 'Garcia',
      createdAt: '2026-01-12T08:30:00Z',
    }
  }
}

const initialContactSessionDetailsPageData = new InitialContactSessionDetailsPageData()
export default initialContactSessionDetailsPageData
