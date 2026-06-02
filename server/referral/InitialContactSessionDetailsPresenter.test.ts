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
    details: {
      heading: 'ICS details',
      changeLink: 'Change',
      dateLabel: 'Date',
      startTimeLabel: 'Start time',
      methodLabel: 'Method',
      reasonLabel: 'Reason session is not in person',
      locationLabel: 'Location',
      informedLabel: 'How {{ name }} was informed about the session',
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
    const viewModel = presenter.buildPageContent(response)
    test('buildPageContent the correct view model', () => {
      expect(viewModel).toMatchSnapshot()
    })
    test('reason row IS in viewModel', () => {
      expect(viewModel.details.rows).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            key: { text: content.details.reasonLabel },
          }),
        ]),
      )
    })
    test('location row IS NOT in viewModel', () => {
      expect(viewModel.details.rows).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            key: { text: content.details.locationLabel },
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
      const viewModel = presenter.buildPageContent(response)
      expect(viewModel).toMatchSnapshot()
      // reason row IS NOT in viewModel
      expect(viewModel.details.rows).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            key: { text: content.details.reasonLabel },
          }),
        ]),
      )
      // location row IS in viewModel
      expect(viewModel.details.rows).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            key: { text: content.details.locationLabel },
          }),
        ]),
      )
    })

    test('with postcode', () => {
      const data = { ...inPersonMeetingData, sessionMethod: { ...inPersonMeetingData.sessionMethod } }
      data.sessionMethod.postcode = 'A11 11A'
      const presenter = new InitialContactSessionDetailsPresenter(data, caseRef)
      expect(presenter.buildPageContent(response)).toMatchSnapshot()
    })

    test('with fullAddress', () => {
      const data = { ...inPersonMeetingData, sessionMethod: { ...inPersonMeetingData.sessionMethod } }
      data.sessionMethod.addressLine1 = '12 Placeholder Lane'
      data.sessionMethod.addressLine2 = 'Floor 2'
      data.sessionMethod.townOrCity = 'Mockington'
      data.sessionMethod.county = 'Mockinghamshire'
      data.sessionMethod.postcode = 'MK0 1AA'
      const presenter = new InitialContactSessionDetailsPresenter(data, caseRef)
      expect(presenter.buildPageContent(response)).toMatchSnapshot()
    })
  })
})
