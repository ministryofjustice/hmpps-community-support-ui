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
    noAppointmentsMessage: 'No appointments scheduled',
    bookAppointmentText: 'Book appointment',
    bookAppointmentHref: '/referral/{{ id }}/create-an-appointment/appointment-type',
    upcomingAppointmentsTitle: 'Upcoming appointments',
    pastAppointmentsTitle: 'Past appointments',
  }

  const makeResponse = () => ({ locals: { content } }) as unknown as Response

  it('renders appointments and activates the appointments tab', () => {
    const response: ReferralAppointmentsBffResponseDto = {
      personDetails: { firstName: 'Alex', lastName: 'Example', dateOfBirth: '1980-01-01', crn: 'X123456' },
      appointments: [
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

    expect(viewModel.pageHeader).toBe('Referral for Alex Example')
    expect(viewModel.hasAppointments).toBe(true)
    expect(viewModel.appointmentsTable.head).toEqual([
      { text: 'Appointment type', attributes: { 'aria-sort': 'none' } },
      { text: 'Date', attributes: { 'aria-sort': 'none' } },
      { text: 'Start time', attributes: { 'aria-sort': 'none' } },
    ])
    expect(viewModel.appointmentsTable.rows).toEqual([
      [
        { text: 'Contact session', attributes: { 'data-sort-value': 'Contact session' } },
        { text: '09 October 2026', attributes: { 'data-sort-value': '2026-10-09' } },
        { text: '2:30pm', attributes: { 'data-sort-value': '14:30' } },
      ],
    ])
    expect(viewModel.appointmentsTable.attributes).toEqual({
      'data-module': 'moj-sortable-table',
      'data-testid': 'referral-appointments-table',
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
      appointments: [
        {
          id: 'appointment-id',
          label: 'Contact session',
          appointmentDate: '2026-10-09',
          appointmentTime,
          appointmentStatus: 'SCHEDULED',
        },
      ],
    }

    const viewModel = new ReferralAppointmentsPresenter(response, caseReference).buildViewModel(makeResponse())

    expect(viewModel.appointmentsTable.rows).toEqual([
      [
        { text: 'Contact session', attributes: { 'data-sort-value': 'Contact session' } },
        { text: '09 October 2026', attributes: { 'data-sort-value': '2026-10-09' } },
        { text, attributes: { 'data-sort-value': sortValue } },
      ],
    ])
  })

  it('renders an empty appointment list when the API returns no appointments', () => {
    const response: ReferralAppointmentsBffResponseDto = {
      personDetails: { firstName: 'Alex', lastName: 'Example', dateOfBirth: '1980-01-01', crn: 'X123456' },
      appointments: [],
    }

    const viewModel = new ReferralAppointmentsPresenter(response, caseReference).buildViewModel(makeResponse())

    expect(viewModel.hasAppointments).toBe(false)
    expect(viewModel.appointmentsTable.rows).toEqual([])
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
      appointments: [],
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
      appointments: [],
    }

    const viewModel = new ReferralAppointmentsPresenter(response, caseReference).buildViewModel(makeResponse())

    expect(viewModel.notificationBanner).toBeUndefined()
  })
})
