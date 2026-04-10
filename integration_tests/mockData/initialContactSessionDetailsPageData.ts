import { AppointmentIcsResponse } from '@community-support-api'
import { randomUUID } from 'node:crypto'

class InitialContactSessionDetailsPageData {
  virtual(): AppointmentIcsResponse {
    return {
      appointmentIcsId: randomUUID(),
      appointmentId: randomUUID(),
      referralId: randomUUID(),
      appointmentType: 'ICS',
      appointmentDate: '2026-02-01',
      appointmentTime: {
        hour: 10,
        minute: 0,
        amPm: 'am',
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

  inPersion(): AppointmentIcsResponse {
    return {
      appointmentIcsId: randomUUID(),
      appointmentId: randomUUID(),
      referralId: randomUUID(),
      appointmentType: 'ICS',
      appointmentDate: '2026-02-10',
      appointmentTime: {
        hour: 9,
        minute: 30,
        amPm: 'am',
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
