import { Request, Response } from 'express'
import { AppointmentIcsResponse } from '@community-support-api'
import AppointmentService from '../../services/AppointmentService'
import AppointmentValidator from '../AppointmentValidator'
import { ScheduledIcsFormDataResolver } from './ScheduledIcsFormDataResolver'

describe('ScheduledIcsFormDataResolver', () => {
  const getICS = jest.fn()
  const service = {
    getICS,
  } as unknown as AppointmentService
  const resolver = new ScheduledIcsFormDataResolver(service, new AppointmentValidator())
  describe('resolve from session', () => {
    test('meeting by phone', async () => {
      const existing = {
        date: '2026-06-18',
        time: {
          hour: 11,
          minute: 30,
          amPm: 'AM',
        },
        sessionMethodRequest: {
          type: 'PHONE',
          additionalDetails: 'abcdefg',
        },
        sessionCommunication: ['informedByPhone', 'informedByTextMessage', 'informedByEmail', 'stuff'],
      }
      const req = {
        session: {
          createAppointmentRequest: existing,
        },
      } as unknown as Request
      const res = {} as unknown as Response
      const formData = await resolver.resolve(req, res)
      expect(formData.ByPhone).toBe('abcdefg')
      expect(formData.informedMethods).toStrictEqual([
        'informedByPhone',
        'informedByTextMessage',
        'informedByEmail',
        'stuff',
      ])
      expect(formData.otherMethodOfContact).toBe('stuff')
      expect(formData.sessionDate).toBe('18/6/2026')
      expect(formData.sessionTakePlace).toBe('ByPhone')
      expect(formData.ByPhone).toBe('abcdefg')
      expect(formData['sessionTime-meridiem']).toBe('am')
      expect(formData['sessionTime-minute']).toBe('30')
      expect(formData['sessionTime-hour']).toBe('11')
    })
    test('meeting by video', async () => {
      const existing = {
        date: '2026-06-18',
        time: {
          hour: 1,
          minute: 30,
          amPm: 'PM',
        },
        sessionMethodRequest: {
          type: 'VIDEO',
          additionalDetails: 'Checkin',
        },
        sessionCommunication: ['informedByPhone', 'informedByTextMessage', 'informedByEmail'],
      }
      const req = {
        session: {
          createAppointmentRequest: existing,
        },
      } as unknown as Request
      const res = {} as unknown as Response
      const formData = await resolver.resolve(req, res)
      expect(formData.informedMethods).toStrictEqual(['informedByPhone', 'informedByTextMessage', 'informedByEmail'])
      expect(formData.otherMethodOfContact).toBe('')
      expect(formData.sessionDate).toBe('18/6/2026')
      expect(formData.sessionTakePlace).toBe('ByVideo')
      expect(formData.byVideo).toBe('Checkin')
      expect(formData['sessionTime-meridiem']).toBe('pm')
      expect(formData['sessionTime-minute']).toBe('30')
      expect(formData['sessionTime-hour']).toBe('1')
    })
    test('meeting in probation office', async () => {
      const existing = {
        date: '2026-06-18',
        time: {
          hour: 10,
          minute: 0,
          amPm: 'AM',
        },
        sessionMethodRequest: {
          type: 'IN_PERSON_PROBATION_OFFICE',
          additionalDetails: 'Derbyshire: Ilkeston Probation Office',
        },
        sessionCommunication: ['informedByPhone', 'informedByTextMessage'],
      }
      const req = {
        session: {
          createAppointmentRequest: existing,
        },
      } as unknown as Request
      const res = {} as unknown as Response
      const formData = await resolver.resolve(req, res)
      expect(formData.informedMethods).toStrictEqual(['informedByPhone', 'informedByTextMessage'])
      expect(formData.otherMethodOfContact).toBe('')
      expect(formData.sessionDate).toBe('18/6/2026')
      expect(formData.sessionTakePlace).toBe('InProbationOffice')
      expect(formData.probationOffice).toBe('Derbyshire: Ilkeston Probation Office')
      expect(formData['sessionTime-meridiem']).toBe('am')
      expect(formData['sessionTime-minute']).toBe('0')
      expect(formData['sessionTime-hour']).toBe('10')
    })
    test('meeting somewhere else', async () => {
      const existing = {
        date: '2026-06-18',
        time: {
          hour: 10,
          minute: 0,
          amPm: 'AM',
        },
        sessionMethodRequest: {
          type: 'IN_PERSON_OTHER_LOCATION',
          addressLine1: 'address1',
          addressLine2: 'address2',
          townOrCity: 'town',
          county: 'county',
          postcode: 'postcode',
        },
        sessionCommunication: ['informedByTextMessage'],
      }
      const req = {
        session: {
          createAppointmentRequest: existing,
        },
      } as unknown as Request
      const res = {} as unknown as Response
      const formData = await resolver.resolve(req, res)
      expect(formData.informedMethods).toStrictEqual(['informedByTextMessage'])
      expect(formData.otherMethodOfContact).toBe('')
      expect(formData.sessionDate).toBe('18/6/2026')
      expect(formData.sessionTakePlace).toBe('InSomewhereElse')
      expect(formData.addressLine1).toBe('address1')
      expect(formData.addressLine2).toBe('address2')
      expect(formData.addressTown).toBe('town')
      expect(formData.addressCounty).toBe('county')
      expect(formData.addressPostcode).toBe('postcode')
      expect(formData['sessionTime-meridiem']).toBe('am')
      expect(formData['sessionTime-minute']).toBe('0')
      expect(formData['sessionTime-hour']).toBe('10')
    })
  })

  describe('resolve from ics', () => {
    beforeEach(() => {
      getICS.mockClear()
    })
    test('meeting by phone', async () => {
      const ics: AppointmentIcsResponse = {
        appointmentIcsId: 'c042a000-30b5-484b-9c03-f6ebcd47fb1f',
        appointmentId: '727a26fb-5f28-4478-a345-58e9ae4eaa64',
        referralId: '13903fcd-0394-4cd0-ab8f-06fa7df506fd',
        caseReference: 'RF9364SE',
        appointmentType: 'ICS',
        appointmentDate: '2026-06-18',
        appointmentTime: {
          hour: 10,
          minute: 0,
          amPm: 'am',
        },
        appointmentStatus: 'SCHEDULED',
        sessionMethod: {
          appointmentCategory: 'VIRTUAL',
          type: 'PHONE',
          whyNotInPersonReason: 'Check in',
        },
        sessionCommunications: ['informedByPhone', 'informedByTextMessage'],
        referralFirstName: 'Omar',
        referralLastName: 'Pfeffer',
        createdAt: '2026-06-15T08:51:28.415314Z',
        changeAppointmentDetails: {
          changeRequestedBy: null,
          reasonForChange: null,
        },
      }
      getICS.mockResolvedValue(ics)
      const req = {
        params: { caseRefId: 'RF9364SE' },
      } as unknown as Request
      const res = {
        locals: {
          user: { username: 'name' },
        },
      } as unknown as Response
      const formData = await resolver.resolve(req, res)
      expect(getICS).toHaveBeenCalledWith('RF9364SE', 'name')
      expect(formData.informedMethods).toStrictEqual(['informedByPhone', 'informedByTextMessage'])
      expect(formData.sessionDate).toBe('18/6/2026')
      expect(formData.sessionTakePlace).toBe('ByPhone')
      expect(formData.ByPhone).toBe('Check in')
      expect(formData['sessionTime-meridiem']).toBe('am')
      expect(formData['sessionTime-minute']).toBe('0')
      expect(formData['sessionTime-hour']).toBe('10')
    })
    test('meeting by video', async () => {
      const ics: AppointmentIcsResponse = {
        appointmentIcsId: 'c042a000-30b5-484b-9c03-f6ebcd47fb1f',
        appointmentId: '727a26fb-5f28-4478-a345-58e9ae4eaa64',
        referralId: '13903fcd-0394-4cd0-ab8f-06fa7df506fd',
        caseReference: 'RF9364SE',
        appointmentType: 'ICS',
        appointmentDate: '2026-06-18',
        appointmentTime: {
          hour: 10,
          minute: 0,
          amPm: 'am',
        },
        appointmentStatus: 'SCHEDULED',
        sessionMethod: {
          appointmentCategory: 'VIRTUAL',
          type: 'VIDEO',
          whyNotInPersonReason: 'Check in',
        },
        sessionCommunications: ['informedByPhone', 'informedByTextMessage', 'abcdef'],
        referralFirstName: 'Omar',
        referralLastName: 'Pfeffer',
        createdAt: '2026-06-15T08:51:28.415314Z',
        changeAppointmentDetails: {
          changeRequestedBy: null,
          reasonForChange: null,
        },
      }
      getICS.mockResolvedValue(ics)
      const req = {
        params: { caseRefId: 'RF9364SE' },
      } as unknown as Request
      const res = {
        locals: {
          user: { username: 'name' },
        },
      } as unknown as Response
      const formData = await resolver.resolve(req, res)
      expect(formData.informedMethods).toStrictEqual(['informedByPhone', 'informedByTextMessage', 'abcdef'])
      expect(formData.otherMethodOfContact).toBe('abcdef')
      expect(formData.sessionDate).toBe('18/6/2026')
      expect(formData.sessionTakePlace).toBe('ByVideo')
      expect(formData.byVideo).toBe('Check in')
      expect(formData['sessionTime-meridiem']).toBe('am')
      expect(formData['sessionTime-minute']).toBe('0')
      expect(formData['sessionTime-hour']).toBe('10')
    })
    test('meeting in probation office', async () => {
      const ics: AppointmentIcsResponse = {
        appointmentIcsId: 'ba697c51-607c-4c43-a7b6-19bfb43bde0e',
        appointmentId: '712adc86-d391-4218-ae39-de06977533ab',
        referralId: '13903fcd-0394-4cd0-ab8f-06fa7df506fd',
        caseReference: 'RF9364SE',
        appointmentType: 'ICS',
        appointmentDate: '2026-06-18',
        appointmentTime: {
          hour: 10,
          minute: 0,
          amPm: 'am',
        },
        appointmentStatus: 'SCHEDULED',
        sessionMethod: {
          appointmentCategory: 'IN_PERSON',
          type: 'IN_PERSON_PROBATION_OFFICE',
          probationOfficeName: 'Derbyshire: Buxton Probation Office',
        },
        sessionCommunications: ['informedByPhone', 'informedByTextMessage', 'abcdefg'],
        referralFirstName: 'Omar',
        referralLastName: 'Pfeffer',
        createdAt: '2026-06-16T08:14:57.517321Z',
        changeAppointmentDetails: {
          changeRequestedBy: null,
          reasonForChange: null,
        },
      }
      getICS.mockResolvedValue(ics)
      const req = {
        params: { caseRefId: 'RF9364SE' },
      } as unknown as Request
      const res = {
        locals: {
          user: { username: 'name' },
        },
      } as unknown as Response
      const formData = await resolver.resolve(req, res)
      expect(formData.informedMethods).toStrictEqual(['informedByPhone', 'informedByTextMessage', 'abcdefg'])
      expect(formData.otherMethodOfContact).toBe('abcdefg')
      expect(formData.sessionDate).toBe('18/6/2026')
      expect(formData.sessionTakePlace).toBe('InProbationOffice')
      expect(formData.probationOffice).toBe('Derbyshire: Buxton Probation Office')
      expect(formData['sessionTime-meridiem']).toBe('am')
      expect(formData['sessionTime-minute']).toBe('0')
      expect(formData['sessionTime-hour']).toBe('10')
    })
    test('meeting somewhere else', async () => {
      const ics: AppointmentIcsResponse = {
        appointmentIcsId: 'cdb70dbc-bec2-40f3-aa34-7db2c13069ff',
        appointmentId: 'd76b6622-b83f-4403-a1c4-cb667ef9a404',
        referralId: '13903fcd-0394-4cd0-ab8f-06fa7df506fd',
        caseReference: 'RF9364SE',
        appointmentType: 'ICS',
        appointmentDate: '2026-06-18',
        appointmentTime: {
          hour: 10,
          minute: 0,
          amPm: 'am',
        },
        appointmentStatus: 'SCHEDULED',
        sessionMethod: {
          appointmentCategory: 'IN_PERSON',
          type: 'IN_PERSON_OTHER_LOCATION',
          addressLine1: 'address1',
          addressLine2: 'address2',
          townOrCity: 'town',
          county: 'county',
          postcode: 'postcode',
        },
        sessionCommunications: ['abcdefg'],
        referralFirstName: 'Omar',
        referralLastName: 'Pfeffer',
        createdAt: '2026-06-16T08:28:56.238381Z',
        changeAppointmentDetails: {
          changeRequestedBy: null,
          reasonForChange: null,
        },
      }
      getICS.mockResolvedValue(ics)
      const req = {
        params: { caseRefId: 'RF9364SE' },
      } as unknown as Request
      const res = {
        locals: {
          user: { username: 'name' },
        },
      } as unknown as Response
      const formData = await resolver.resolve(req, res)
      expect(formData.informedMethods).toStrictEqual(['abcdefg'])
      expect(formData.otherMethodOfContact).toBe('abcdefg')
      expect(formData.sessionDate).toBe('18/6/2026')
      expect(formData.sessionTakePlace).toBe('InSomewhereElse')
      expect(formData.addressLine1).toBe('address1')
      expect(formData.addressLine2).toBe('address2')
      expect(formData.addressTown).toBe('town')
      expect(formData.addressCounty).toBe('county')
      expect(formData.addressPostcode).toBe('postcode')
      expect(formData['sessionTime-meridiem']).toBe('am')
      expect(formData['sessionTime-minute']).toBe('0')
      expect(formData['sessionTime-hour']).toBe('10')
    })
  })
})
