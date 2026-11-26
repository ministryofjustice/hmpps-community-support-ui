import { AppointmentIcsResponse } from '@community-support-api'
import { randomUUID } from 'node:crypto'
import { globalContent } from '../../assets/content/GlobalContent'
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

  const caseRef = 'ref-id'

  const currentContent: InitialContactSessionDetailsContent = {
    ...globalContent.referralDetails.id.page,
    ...globalContent.referralDetails.id.icsViewOrChange,
  }
  const historicalContent: InitialContactSessionDetailsContent = {
    ...globalContent.referralDetails.id.page,
    ...globalContent.referralDetails.id.changedIcsDetails.id,
  }

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

    const presenter = new InitialContactSessionDetailsPresenter(virtualMeetingData, caseRef, () => currentContent)
    const viewModel = presenter.buildViewModel()
    test('buildPageContent the correct view model', () => {
      expect(viewModel).toMatchSnapshot()
    })
    test('uses the injected content provider for titles, labels and links', () => {
      const getContent = jest.fn(() => ({ ...content, title: 'Custom title', heading: 'Custom heading' }))
      const injectedPresenter = new InitialContactSessionDetailsPresenter(virtualMeetingData, caseRef, getContent)

      const injectedViewModel = injectedPresenter.buildViewModel()

      expect(getContent).toHaveBeenCalledTimes(1)
      expect(injectedViewModel.title).toBe('Custom title')
      expect(injectedViewModel.heading).toBe('Custom heading')
      expect(injectedViewModel.backLink.href).toBe('/referral/ref-id/ics-change-details')
      expect(injectedViewModel.icsDetails.card.title.text).toBe(content.icsDetails.heading)
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
      const presenter = new InitialContactSessionDetailsPresenter(inPersonMeetingData, caseRef, () => currentContent)
      const viewModel = presenter.buildViewModel()
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
      const presenter = new InitialContactSessionDetailsPresenter(data, caseRef, () => currentContent)
      expect(presenter.buildViewModel()).toMatchSnapshot()
    })

    test('with fullAddress', () => {
      const data = { ...inPersonMeetingData, sessionMethod: { ...inPersonMeetingData.sessionMethod } }
      data.sessionMethod.addressLine1 = '12 Placeholder Lane'
      data.sessionMethod.addressLine2 = 'Floor 2'
      data.sessionMethod.townOrCity = 'Mockington'
      data.sessionMethod.county = 'Mockinghamshire'
      data.sessionMethod.postcode = 'MK0 1AA'
      const presenter = new InitialContactSessionDetailsPresenter(data, caseRef, () => currentContent)
      expect(presenter.buildViewModel()).toMatchSnapshot()
    })

    test('shows and escapes a saved prison name', () => {
      const data: AppointmentIcsResponse = {
        ...inPersonMeetingData,
        appointmentType: 'PRE_RELEASE_SESSION',
        sessionMethod: {
          appointmentCategory: 'IN_PERSON',
          type: 'IN_PERSON_PRISON',
          prisonCode: 'MDI',
          prisonName: 'Moorland (HMP & YOI)',
        },
      }
      const { rows } = new InitialContactSessionDetailsPresenter(data, caseRef, () => currentContent).buildViewModel()
        .icsDetails
      expect(rows).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ key: { text: 'Method' }, value: { text: 'In person - prison' } }),
          expect.objectContaining({ key: { text: 'Location' }, value: { html: '<p>Moorland (HMP &amp; YOI)</p>' } }),
        ]),
      )
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
      const presenter = new InitialContactSessionDetailsPresenter(data, caseRef, () => historicalContent, true)
      const viewModel = presenter.buildViewModel()
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
