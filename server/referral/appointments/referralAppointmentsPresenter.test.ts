import type { Response } from 'express'
import type { ReferralAppointmentsBffResponseDto } from '@community-support-api'
import ReferralAppointmentsPresenter from './referralAppointmentsPresenter'
import type { ReferralAppointmentsContent } from './referralAppointmentsViewModel'
import { globalContent } from '../../../assets/content/GlobalContent'

describe('ReferralAppointmentsPresenter', () => {
  const caseReference = 'AB1234CD'
  const content: ReferralAppointmentsContent = {
    ...globalContent['/referral/:id/appointments'],
    pageHeader: 'Referral for',
    appointmentsTitle: 'Appointments',
    appointmentTypeColumnHeader: 'Appointment type',
    dateColumnHeader: 'Date',
    timeColumnHeader: 'Start time',
    statusColumnHeader: 'Status',
    actionColumnHeader: 'Action',
    noAppointmentsMessage: 'No appointments scheduled',
    noUpcomingAppointmentsMessage: 'No upcoming appointments',
    noPastAppointmentsMessage: 'No past appointments',
    bookAppointmentText: 'Book appointment',
    bookAppointmentHref: '/referral/{{ id }}/create-an-appointment/appointment-type',
    upcomingAppointmentsTitle: 'Upcoming appointments',
    pastAppointmentsTitle: 'Past appointments',
  }

  const scheduledCells = [
    {
      html: '<strong class="govuk-tag govuk-tag--blue">Scheduled</strong>',
      attributes: { 'data-sort-value': 'Scheduled' },
    },
    {
      classes: 'govuk-table__cell--numeric',
      html: '<a href="#">View or change details</a>',
      attributes: { 'data-sort-value': 'Scheduled' },
    },
  ]

  const makeResponse = () => ({ locals: { content } }) as unknown as Response

  it('renders appointments and activates the appointments tab', () => {
    const response: ReferralAppointmentsBffResponseDto = {
      personDetails: { firstName: 'Alex', lastName: 'Example', dateOfBirth: '1980-01-01', crn: 'X123456' },
      upcomingAppointments: [
        {
          id: 'appointment-id',
          label: 'Contact session',
          appointmentDate: '2026-10-09',
          appointmentTime: { hour: 2, minute: 30, amPm: 'pm' },
          appointmentStatus: 'SCHEDULED',
        },
      ],
      pastAppointments: [
        {
          id: 'past-appointment-id',
          label: 'Initial assessment',
          appointmentDate: '2026-09-01',
          appointmentTime: { hour: 9, minute: 0, amPm: 'am' },
          appointmentStatus: 'SCHEDULED',
        },
      ],
    }

    const viewModel = new ReferralAppointmentsPresenter(response, caseReference).buildViewModel(makeResponse())

    expect(viewModel.pageHeader).toBe('Referral for Alex Example')
    expect(viewModel.hasAppointments).toBe(true)
    expect(viewModel.upcomingAppointmentsTable.head).toEqual([
      { text: 'Appointment type', attributes: { 'aria-sort': 'none' } },
      { text: 'Date', attributes: { 'aria-sort': 'ascending' } },
      { text: 'Start time', attributes: { 'aria-sort': 'none' } },
      { text: 'Status', attributes: { 'aria-sort': 'none' } },
      { text: 'Action', classes: 'govuk-table__header--numeric', attributes: { 'aria-sort': 'none' } },
    ])
    expect(viewModel.upcomingAppointmentsTable.rows).toEqual([
      [
        { text: 'Contact session', attributes: { 'data-sort-value': 'Contact session' } },
        { text: '09 October 2026', attributes: { 'data-sort-value': '2026-10-09T14:30' } },
        { text: '2:30pm', attributes: { 'data-sort-value': '14:30' } },
        ...scheduledCells,
      ],
    ])
    expect(viewModel.upcomingAppointmentsTable.classes).toBe('appointments-table')
    expect(viewModel.pastAppointmentsTable.classes).toBe('appointments-table')
    expect(viewModel.hasUpcomingAppointments).toBe(true)
    expect(viewModel.hasPastAppointments).toBe(true)
    expect(viewModel.upcomingAppointmentsTable.attributes).toEqual({
      'data-module': 'moj-sortable-table',
      'data-testid': 'referral-upcoming-appointments-table',
    })
    expect(viewModel.pastAppointmentsTable.head).toEqual(viewModel.upcomingAppointmentsTable.head)
    expect(viewModel.pastAppointmentsTable.rows).toEqual([
      [
        { text: 'Initial assessment', attributes: { 'data-sort-value': 'Initial assessment' } },
        { text: '01 September 2026', attributes: { 'data-sort-value': '2026-09-01T09:00' } },
        { text: '9:00am', attributes: { 'data-sort-value': '09:00' } },
        ...scheduledCells,
      ],
    ])
    expect(viewModel.pastAppointmentsTable.attributes).toEqual({
      'data-module': 'moj-sortable-table',
      'data-testid': 'referral-past-appointments-table',
    })
    expect(viewModel.createAppointmentButton).toEqual({
      text: 'Book appointment',
      href: `/referral/${caseReference}/create-an-appointment/appointment-type`,
      preventDoubleClick: true,
    })
    expect(viewModel.navBar.items.find(item => item.active)).toMatchObject({
      text: 'Appointments',
      href: `/referral/${caseReference}/appointments`,
    })
    expect(viewModel.navBar.items.map(item => item.text)).toEqual([
      'Case details',
      'Progress',
      'Action Plan',
      'Appointments',
      'Change log',
    ])
    expect(viewModel.navBar.items[2]).toEqual({
      text: 'Action Plan',
      href: `/referral/${caseReference}/action-plan`,
      active: false,
    })
    expect(viewModel.appointmentsTitle).toBe('Appointments')
    expect(viewModel.noAppointmentsMessage).toBe('No appointments scheduled')
    expect(viewModel.upcomingAppointmentsTitle).toBe('Upcoming appointments')
    expect(viewModel.pastAppointmentsTitle).toBe('Past appointments')
  })

  it.each([
    [{ hour: 12, minute: 0, amPm: 'am' }, '12:00am', '00:00'],
    [{ hour: 12, minute: 0, amPm: 'pm' }, '12:00pm', '12:00'],
    [{ hour: 9, minute: 5, amPm: 'AM' }, '9:05am', '09:05'],
    [{ hour: 11, minute: 59, amPm: 'PM' }, '11:59pm', '23:59'],
  ])('uses a 24-hour sort value for %j while retaining the display time', (appointmentTime, text, sortValue) => {
    const response: ReferralAppointmentsBffResponseDto = {
      personDetails: { firstName: 'Alex', lastName: 'Example', dateOfBirth: '1980-01-01', crn: 'X123456' },
      upcomingAppointments: [
        {
          id: 'appointment-id',
          label: 'Contact session',
          appointmentDate: '2026-10-09',
          appointmentTime,
          appointmentStatus: 'SCHEDULED',
        },
      ],
      pastAppointments: [],
    }

    const viewModel = new ReferralAppointmentsPresenter(response, caseReference).buildViewModel(makeResponse())

    expect(viewModel.upcomingAppointmentsTable.rows).toEqual([
      [
        { text: 'Contact session', attributes: { 'data-sort-value': 'Contact session' } },
        { text: '09 October 2026', attributes: { 'data-sort-value': `2026-10-09T${sortValue}` } },
        { text, attributes: { 'data-sort-value': sortValue } },
        ...scheduledCells,
      ],
    ])
  })

  it.each([
    ['SCHEDULED', 'Scheduled', 'govuk-tag--blue', ['View or change details']],
    ['NEEDS_FEEDBACK', 'Needs feedback', 'govuk-tag--red', ['Add attendance and feedback']],
    ['COMPLETED', 'Completed', 'govuk-tag--green', ['View feedback']],
    ['CHANGED', 'Changed', 'govuk-tag--orange', ['View session details']],
    ['DID_NOT_ATTEND', 'Did not attend', 'govuk-tag--magenta', ['Reschedule', 'View feedback']],
    ['DID_NOT_HAPPEN', 'Did not happen', 'govuk-tag--magenta', ['Reschedule', 'View feedback']],
  ] as const)('renders status tag and actions for %s', (status, text, tagClass, actions) => {
    const response = {
      personDetails: { firstName: 'Alex', lastName: 'Example', dateOfBirth: '1980-01-01', crn: 'X123456' },
      upcomingAppointments: [
        {
          id: 'appointment-id',
          label: 'Contact session',
          appointmentDate: '2026-10-09',
          appointmentTime: { hour: 2, minute: 30, amPm: 'pm' },
          appointmentStatus: status,
        },
      ],
      pastAppointments: [],
    } as ReferralAppointmentsBffResponseDto

    const [row] = new ReferralAppointmentsPresenter(response, caseReference).buildViewModel(makeResponse())
      .upcomingAppointmentsTable.rows

    expect(row[3]).toEqual({
      html: `<strong class="govuk-tag ${tagClass}">${text}</strong>`,
      attributes: { 'data-sort-value': text },
    })
    expect(row[4]).toEqual({
      classes: 'govuk-table__cell--numeric',
      html: actions.map(action => `<a href="#">${action}</a>`).join('<br> '),
      attributes: { 'data-sort-value': text },
    })
  })

  it.each(['upcomingAppointments', 'pastAppointments'] as const)(
    'renders appointments when only %s is populated',
    appointmentList => {
      const response: ReferralAppointmentsBffResponseDto = {
        personDetails: { firstName: 'Alex', lastName: 'Example', dateOfBirth: '1980-01-01', crn: 'X123456' },
        upcomingAppointments: [],
        pastAppointments: [],
        [appointmentList]: [
          {
            id: 'appointment-id',
            label: 'Contact session',
            appointmentDate: '2026-10-09',
            appointmentTime: { hour: 2, minute: 30, amPm: 'pm' },
            appointmentStatus: 'SCHEDULED',
          },
        ],
      }

      const viewModel = new ReferralAppointmentsPresenter(response, caseReference).buildViewModel(makeResponse())

      expect(viewModel.hasAppointments).toBe(true)
      expect(viewModel.hasUpcomingAppointments).toBe(appointmentList === 'upcomingAppointments')
      expect(viewModel.hasPastAppointments).toBe(appointmentList === 'pastAppointments')
      expect(viewModel.noUpcomingAppointmentsMessage).toBe('No upcoming appointments')
      expect(viewModel.noPastAppointmentsMessage).toBe('No past appointments')
      expect(viewModel.upcomingAppointmentsTable.rows).toHaveLength(appointmentList === 'upcomingAppointments' ? 1 : 0)
      expect(viewModel.pastAppointmentsTable.rows).toHaveLength(appointmentList === 'pastAppointments' ? 1 : 0)
    },
  )

  it('renders an empty appointment list when the API returns no appointments', () => {
    const response: ReferralAppointmentsBffResponseDto = {
      personDetails: { firstName: 'Alex', lastName: 'Example', dateOfBirth: '1980-01-01', crn: 'X123456' },
      upcomingAppointments: [],
      pastAppointments: [],
    }

    const viewModel = new ReferralAppointmentsPresenter(response, caseReference).buildViewModel(makeResponse())

    expect(viewModel.hasAppointments).toBe(false)
    expect(viewModel.hasUpcomingAppointments).toBe(false)
    expect(viewModel.hasPastAppointments).toBe(false)
    expect(viewModel.upcomingAppointmentsTable.rows).toEqual([])
    expect(viewModel.pastAppointmentsTable.rows).toEqual([])
    expect(viewModel.noAppointmentsMessage).toBe('No appointments scheduled')
    expect(viewModel.createAppointmentButton).toEqual({
      text: 'Book appointment',
      href: `/referral/${caseReference}/create-an-appointment/appointment-type`,
      preventDoubleClick: true,
    })
  })

  it('shows a success alert after an appointment has been created', () => {
    const response: ReferralAppointmentsBffResponseDto = {
      personDetails: { firstName: 'Alex', lastName: 'Example', dateOfBirth: '1980-01-01', crn: 'X123456' },
      upcomingAppointments: [],
      pastAppointments: [],
    }
    const successAlert = {
      title: 'Contact session booked',
      message: 'Contact session booked for 09 October 2026 at 2:30pm',
    }

    const viewModel = new ReferralAppointmentsPresenter(response, caseReference, successAlert).buildViewModel(
      makeResponse(),
    )

    expect(viewModel.notificationBanner).toEqual({
      variant: 'success',
      title: successAlert.title,
      html: successAlert.message,
      dismissible: true,
      showTitleAsHeading: true,
    })
  })

  it('does not show a notification banner when there is no success alert', () => {
    const response: ReferralAppointmentsBffResponseDto = {
      personDetails: { firstName: 'Alex', lastName: 'Example', dateOfBirth: '1980-01-01', crn: 'X123456' },
      upcomingAppointments: [],
      pastAppointments: [],
    }

    const viewModel = new ReferralAppointmentsPresenter(response, caseReference).buildViewModel(makeResponse())

    expect(viewModel.notificationBanner).toBeUndefined()
  })
})
