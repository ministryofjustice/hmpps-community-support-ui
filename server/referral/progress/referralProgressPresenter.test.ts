import { Response } from 'express'
import { ReferralProgress } from '@community-support-api'
import { ReferralProgressContent } from './referralProgressViewModel'
import ReferralProgressPresenter from './referralProgressPresenter'
import buildReferralProgress from '../../testutils/buildReferralProgress'

describe('ReferralProgressPresenter', () => {
  const caseReference = 'AB1234CD'

  const mockContent: ReferralProgressContent = {
    pageHeader: 'Referral for',
    progressSubNavTitle: 'Progress',
    subNavItems: [],
    progressActiveColumnHeaders: ['Date and time', 'Status', 'Action'],
    progressInactiveColumnHeaders: ['Status', 'Action'],
  }

  const mockResponse = { locals: { content: mockContent } } as unknown as Response

  it('renders NOT SCHEDULED table correctly when no appointments exist', () => {
    const referralProgressNoAppointments: ReferralProgress = buildReferralProgress([{ events: [] }])
    const presenter = new ReferralProgressPresenter(referralProgressNoAppointments, caseReference)
    const viewModel = presenter.buildPageContent(mockResponse)

    expect(viewModel.icsAppointmentTable.head).toEqual([{ text: 'Status' }, { text: 'Action' }])
    expect(viewModel.icsAppointmentTable.rows).toEqual([
      [{ html: expect.stringContaining('Not scheduled') }, { html: expect.stringContaining('Schedule session') }],
    ])
  })

  it('renders one row per appointmentId and sorts by latest date descending', () => {
    const referralProgressWithAppointments = buildReferralProgress([
      {
        appointmentId: 'appId1',
        events: [
          { status: 'SCHEDULED', dateTime: '2026-03-25T10:00:00' },
          { status: 'NEEDS_FEEDBACK', dateTime: '2026-03-26T10:00:00' },
          { status: 'COMPLETED', dateTime: '2026-03-27T10:00:00' },
        ],
      },
      {
        appointmentId: 'appId2',
        events: [{ status: 'SCHEDULED', dateTime: '2026-03-28T10:00:00' }],
      },
    ])

    const presenter = new ReferralProgressPresenter(referralProgressWithAppointments, caseReference)
    const viewModel = presenter.buildPageContent(mockResponse)
    const { rows } = viewModel.icsAppointmentTable

    expect(rows).toHaveLength(2)
    expect(rows[0][1].html).toContain('Scheduled')
    expect(rows[0][1].html).toContain('govuk-tag--blue')
    expect(rows[1][1].html).toContain('Completed')
    expect(rows[1][1].html).toContain('govuk-tag--green')
  })

  it('renders notification banner if latest appointment is at SCHEDULED status and show notification banner is true', () => {
    const referralProgressWithAppointments = buildReferralProgress([
      {
        appointmentId: 'appId1',
        events: [
          { status: 'SCHEDULED', dateTime: '2026-03-26T10:00:00' },
          { status: 'NEEDS_FEEDBACK', dateTime: '2026-03-27T10:00:00' },
        ],
      },
      {
        appointmentId: 'appId2',
        events: [{ status: 'SCHEDULED', dateTime: '2026-03-28T10:00:00' }],
      },
    ])

    const presenter = new ReferralProgressPresenter(referralProgressWithAppointments, caseReference, true)
    const viewModel = presenter.buildPageContent(mockResponse)

    expect(viewModel.notificationBanner?.type).toEqual('success')
    expect(viewModel.notificationBanner?.html).toContain('ICS has been scheduled')
  })

  it('does not render notification banner if show notification banner is false', () => {
    const referralProgressWithAppointments = buildReferralProgress([
      {
        appointmentId: 'appId1',
        events: [
          { status: 'SCHEDULED', dateTime: '2026-03-26T10:00:00' },
          { status: 'NEEDS_FEEDBACK', dateTime: '2026-03-27T10:00:00' },
        ],
      },
      {
        appointmentId: 'appId2',
        events: [{ status: 'SCHEDULED', dateTime: '2026-03-28T10:00:00' }],
      },
    ])

    const presenter = new ReferralProgressPresenter(referralProgressWithAppointments, caseReference, false)
    const viewModel = presenter.buildPageContent(mockResponse)

    expect(viewModel.notificationBanner).toBeUndefined()
  })

  it('renders SCHEDULED appointment correctly and should display notification banner', () => {
    const referralProgressWithAppointments = buildReferralProgress([
      {
        events: [{ status: 'SCHEDULED', dateTime: '2026-03-27T13:00:00' }],
      },
    ])

    const presenter = new ReferralProgressPresenter(referralProgressWithAppointments, caseReference, true)
    const viewModel = presenter.buildPageContent(mockResponse)

    expect(viewModel.icsAppointmentTable.head).toEqual([
      { text: 'Date and time' },
      { text: 'Status' },
      { text: 'Action' },
    ])
    expect(viewModel.icsAppointmentTable.rows[0][0].text).toBe('27 March 2026 at 1:00pm')
    expect(viewModel.icsAppointmentTable.rows[0][1].html).toContain('Scheduled')
    expect(viewModel.icsAppointmentTable.rows[0][1].html).toContain('govuk-tag--blue')
    expect(viewModel.icsAppointmentTable.rows[0][2].html).toContain('View or change details')
    expect(viewModel.notificationBanner?.html).toContain('ICS has been scheduled')
  })

  it('renders NEEDS_FEEDBACK action correctly and should not display notification banner', () => {
    const referralProgressWithAppointments = buildReferralProgress([
      {
        events: [
          { status: 'SCHEDULED', dateTime: '2026-03-25T10:00:00' },
          { status: 'NEEDS_FEEDBACK', dateTime: '2026-03-27T10:00:00' },
        ],
      },
    ])

    const presenter = new ReferralProgressPresenter(referralProgressWithAppointments, caseReference)
    const viewModel = presenter.buildPageContent(mockResponse)

    expect(viewModel.icsAppointmentTable.rows[0][1].html).toContain('Needs feedback')
    expect(viewModel.icsAppointmentTable.rows[0][1].html).toContain('govuk-tag--red')
    expect(viewModel.icsAppointmentTable.rows[0][2].html).toContain('Add attendance and feedback')
    expect(viewModel.notificationBanner).toBeUndefined()
  })

  it('renders COMPLETED action correctly and should not display notification banner', () => {
    const referralProgressWithAppointments = buildReferralProgress([
      {
        events: [
          { status: 'SCHEDULED', dateTime: '2026-03-25T10:00:00' },
          { status: 'NEEDS_FEEDBACK', dateTime: '2026-03-26T10:00:00' },
          { status: 'COMPLETED', dateTime: '2026-03-27T10:00:00' },
        ],
      },
    ])

    const presenter = new ReferralProgressPresenter(referralProgressWithAppointments, caseReference)
    const viewModel = presenter.buildPageContent(mockResponse)

    expect(viewModel.icsAppointmentTable.rows[0][1].html).toContain('Completed')
    expect(viewModel.icsAppointmentTable.rows[0][1].html).toContain('govuk-tag--green')
    expect(viewModel.icsAppointmentTable.rows[0][2].html).toContain('View feedback')
    expect(viewModel.notificationBanner).toBeUndefined()
  })

  it('renders DID_NOT_ATTEND correctly', () => {
    const referralProgressWithAppointments = buildReferralProgress([
      {
        events: [{ status: 'DID_NOT_ATTEND', dateTime: '2026-03-27T13:00:00' }],
      },
    ])
    const presenter = new ReferralProgressPresenter(referralProgressWithAppointments, caseReference)
    const viewModel = presenter.buildPageContent(mockResponse)
    const row = viewModel.icsAppointmentTable.rows[0]

    expect(row[1].html).toContain('Did not attend')
    expect(row[1].html).toContain('govuk-tag--purple')
    expect(row[2].html).toContain('Reason for not attending')
  })

  it('renders RESCHEDULED correctly', () => {
    const referralProgressWithAppointments = buildReferralProgress([
      {
        events: [{ status: 'RESCHEDULED', dateTime: '2026-03-27T13:00:00' }],
      },
    ])
    const presenter = new ReferralProgressPresenter(referralProgressWithAppointments, caseReference)
    const viewModel = presenter.buildPageContent(mockResponse)
    const row = viewModel.icsAppointmentTable.rows[0]

    expect(row[1].html).toContain('Rescheduled')
    expect(row[1].html).toContain('govuk-tag--grey')
    expect(row[2].html).toContain('Reschedule Session')
  })
})
