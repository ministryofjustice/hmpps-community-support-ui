import type { Response } from 'express'
import type { ReferralAppointmentsBffResponseDto } from '@community-support-api'
import ReferralAppointmentsPresenter from './referralAppointmentsPresenter'
import type { ReferralAppointmentsContent } from './referralAppointmentsViewModel'

describe('ReferralAppointmentsPresenter', () => {
  const caseReference = 'AB1234CD'
  const content: ReferralAppointmentsContent = {
    pageHeader: 'Referral for',
    appointmentsTitle: 'Appointments',
    appointmentTypeColumnHeader: 'Appointment',
    dateTimeColumnHeader: 'Date and time',
    noAppointmentsMessage: 'No appointments scheduled',
    createAppointmentText: 'Create an Appointment',
    appointmentCreatedSuccessfully: 'Appointment created successfully',
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
    expect(viewModel.appointmentsTable.head).toEqual([{ text: 'Appointment' }, { text: 'Date and time' }])
    expect(viewModel.appointmentsTable.rows).toEqual([
      [{ text: 'Contact session' }, { text: '09 October 2026 at 2:30pm' }],
    ])
    expect(viewModel.appointmentsTable.attributes).toMatchObject({ 'data-module': 'moj-sortable-table' })
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
    expect(viewModel.createAppointmentText).toBe('Create an Appointment')
    expect(viewModel.noAppointmentsMessage).toBe('No appointments scheduled')
    expect(viewModel.createAppointmentHref).toBe(`/referral/${caseReference}/create-an-appointment/appointment-type`)
  })

  it('renders an empty appointment list when the API returns no appointments', () => {
    const response: ReferralAppointmentsBffResponseDto = {
      personDetails: { firstName: 'Alex', lastName: 'Example', dateOfBirth: '1980-01-01', crn: 'X123456' },
      appointments: [],
    }

    const viewModel = new ReferralAppointmentsPresenter(response, caseReference).buildViewModel(makeResponse())

    expect(viewModel.hasAppointments).toBe(false)
    expect(viewModel.appointmentsTable.rows).toEqual([])
  })

  it('shows a success alert after an appointment has been created', () => {
    const response: ReferralAppointmentsBffResponseDto = {
      personDetails: { firstName: 'Alex', lastName: 'Example', dateOfBirth: '1980-01-01', crn: 'X123456' },
      appointments: [],
    }

    const viewModel = new ReferralAppointmentsPresenter(response, caseReference, true).buildViewModel(makeResponse())

    expect(viewModel.notificationBanner).toEqual({
      type: 'success',
      html: '<h3 class="govuk-notification-banner__heading">Appointment created successfully</h3>',
    })
  })
})
