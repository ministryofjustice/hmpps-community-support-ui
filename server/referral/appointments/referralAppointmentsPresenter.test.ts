import type { Response } from 'express'
import type { ReferralAppointmentsBffResponseDto } from '@community-support-api'
import ReferralAppointmentsPresenter from './referralAppointmentsPresenter'
import type { ReferralAppointmentsContent } from './referralAppointmentsViewModel'

describe('ReferralAppointmentsPresenter', () => {
  const caseReference = 'AB1234CD'
  const content: ReferralAppointmentsContent = {
    pageHeader: 'Referral for',
    subNavTitle: 'Referral',
    subNavItems: [
      { id: 'caseDetails', title: 'Case details' },
      { id: 'progress', title: 'Progress' },
      { id: 'appointments', title: 'Appointments' },
      { id: 'changeLog', title: 'Change log' },
    ],
    appointmentsTitle: 'Appointments',
    appointmentTypeColumnHeader: 'Appointment',
    dateTimeColumnHeader: 'Date and time',
    noAppointmentsMessage: 'No appointments scheduled',
    createAppointmentText: 'Create an Appointment',
  }

  const makeResponse = () => ({ locals: { content } }) as unknown as Response

  it('renders appointments and activates the appointments tab', () => {
    const response: ReferralAppointmentsBffResponseDto = {
      personDetails: { firstName: 'Alex', lastName: 'Example', dateOfBirth: '1980-01-01', crn: 'X123456' },
      appointments: [{ id: 'appointment-id', label: 'Contact session', time: '2026-10-09T13:30:00Z' }],
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
    expect(viewModel.createAppointmentHref).toBe(`/referral/${caseReference}/appointment/select-type`)
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
})
