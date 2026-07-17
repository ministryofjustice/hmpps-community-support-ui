import { Response } from 'express'
import { AppointmentIcsResponse } from '@community-support-api'
import { randomUUID } from 'node:crypto'
import InitialContactSessionDetailsPresenter, {
  InitialContactSessionDetailsContent,
} from './InitialContactSessionDetailsPresenter'

describe('InitialContactSessionDetailsPresenter', () => {
  const content: InitialContactSessionDetailsContent = {
    title: 'View or change session details',
    heading: 'View or change session details',
    icsDetails: {
      heading: 'ICS details',
      changeLink: 'Change',
      dateLabel: 'Date',
      startTimeLabel: 'Start time',
      methodLabel: 'Method',
      reasonLabel: 'Reason session is not in person',
      locationLabel: 'Location',
      informedLabel: 'How {{ name }} was informed about the session',
    },
    reasonForChange: {
      heading: 'Reason for change',
      whoRequestedLabel: 'Who requested the change',
      reasonLabel: 'Reason for the change',
    },
    links: {
      change: '/referral/{{ id }}/ics-change-details',
      back: '/referral/{{ id }}/ics-change-details',
    },
  }
  const response = { locals: { content } } as unknown as Response

  const caseRef = 'ref-id'

  describe('virtual meeting', () => {
    const virtualMeetingData = {
      appointmentIcsId: 'ics-id',
      appointmentId: 'appt-id',
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
        whyNotInPersonReason: 'Welfare check call',
      },
      sessionCommunications: ['Phone', 'Text'],
      referralFirstName: 'Alice',
      referralLastName: 'Smith',
      createdAt: '2026-01-10T09:00:00Z',
    } as AppointmentIcsResponse

    const presenter = new InitialContactSessionDetailsPresenter(virtualMeetingData, caseRef)
    const viewModel = presenter.buildViewModel(response)
    test('buildPageContent the correct view model', () => {
      expect(viewModel).toMatchSnapshot()
    })
    test('reason row IS in viewModel', () => {
      expect(viewModel.icsDetails.rows).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            key: { text: content.icsDetails.reasonLabel },
          }),
        ]),
      )
    })
    test('location row IS NOT in viewModel', () => {
      expect(viewModel.icsDetails.rows).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            key: { text: content.icsDetails.locationLabel },
          }),
        ]),
      )
    })
  })

  describe('in person meeting', () => {
    const inPersonMeetingData = {
      appointmentIcsId: 'ics-id',
      appointmentId: 'appt-id',
      referralId: 'ref-id',
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
    } as AppointmentIcsResponse
    test('buildPageContent the correct view model', () => {
      const presenter = new InitialContactSessionDetailsPresenter(inPersonMeetingData, caseRef)
      const viewModel = presenter.buildViewModel(response)
      expect(viewModel).toMatchSnapshot()
      // reason row IS NOT in viewModel
      expect(viewModel.icsDetails.rows).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            key: { text: content.icsDetails.reasonLabel },
          }),
        ]),
      )
      // location row IS in viewModel
      expect(viewModel.icsDetails.rows).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            key: { text: content.icsDetails.locationLabel },
          }),
        ]),
      )
    })

    test('with postcode', () => {
      const data = { ...inPersonMeetingData, sessionMethod: { ...inPersonMeetingData.sessionMethod } }
      data.sessionMethod.postcode = 'A11 11A'
      const presenter = new InitialContactSessionDetailsPresenter(data, caseRef)
      expect(presenter.buildViewModel(response)).toMatchSnapshot()
    })

    test('with fullAddress', () => {
      const data = { ...inPersonMeetingData, sessionMethod: { ...inPersonMeetingData.sessionMethod } }
      data.sessionMethod.addressLine1 = '12 Placeholder Lane'
      data.sessionMethod.addressLine2 = 'Floor 2'
      data.sessionMethod.townOrCity = 'Mockington'
      data.sessionMethod.county = 'Mockinghamshire'
      data.sessionMethod.postcode = 'MK0 1AA'
      const presenter = new InitialContactSessionDetailsPresenter(data, caseRef)
      expect(presenter.buildViewModel(response)).toMatchSnapshot()
    })
  })

  describe('historical meeting', () => {
    const historicalMeetingData = {
      appointmentIcsId: 'ics-id',
      appointmentId: 'appt-id',
      referralId: randomUUID(),
      appointmentType: 'ICS',
      appointmentDate: '2026-02-01',
      appointmentTime: {
        hour: 10,
        minute: 0,
        amPm: 'am',
      },
      appointmentStatus: 'CHANGED',
      sessionMethod: {
        appointmentCategory: 'VIRTUAL',
        type: 'PHONE',
        whyNotInPersonReason: 'Welfare check call',
      },
      sessionCommunications: ['Phone', 'Text'],
      referralFirstName: 'Alice',
      referralLastName: 'Smith',
      createdAt: '2026-01-10T09:00:00Z',
      changeAppointmentDetails: {
        changeRequestedBy: 'REFERRAL_USER',
        reasonForChange: 'Medical emergency',
      },
    } as AppointmentIcsResponse

    test('historical appointment', () => {
      const data = { ...historicalMeetingData, sessionMethod: { ...historicalMeetingData.sessionMethod } }
      const presenter = new InitialContactSessionDetailsPresenter(data, caseRef, true)
      const viewModel = presenter.buildViewModel(response)
      expect(viewModel).toMatchSnapshot()

      expect(viewModel.historical).toBeTruthy()
      expect(viewModel.reasonForChange.rows).toHaveLength(2)
      expect(viewModel.reasonForChange.rows[0].key.text).toEqual('Who requested the change')
      expect(viewModel.reasonForChange.rows[0].value.text).toEqual('Alice Smith')
      expect(viewModel.reasonForChange.rows[1].key.text).toEqual('Reason for the change')
      expect(viewModel.reasonForChange.rows[1].value.text).toEqual('Medical emergency')
    })
  })
})
