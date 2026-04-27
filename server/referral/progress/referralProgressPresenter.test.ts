import { randomUUID } from 'crypto'
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
    const referralProgressNoAppointments: ReferralProgress = buildReferralProgress([
      { appointmentId: randomUUID(), events: [] },
    ])
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
        appointmentId: randomUUID(),
        events: [
          { status: 'SCHEDULED', dateTime: '2026-03-25T10:00:00' },
          { status: 'NEEDS_FEEDBACK', dateTime: '2026-03-26T10:00:00' },
          { status: 'COMPLETED', dateTime: '2026-03-27T10:00:00' },
        ],
      },
      {
        appointmentId: randomUUID(),
        events: [{ status: 'SCHEDULED', dateTime: '2026-03-28T10:00:00' }],
      },
    ])

    const presenter = new ReferralProgressPresenter(referralProgressWithAppointments, caseReference)
    const viewModel = presenter.buildPageContent(mockResponse)

    expect(viewModel.icsAppointmentTable.rows).toHaveLength(2)
    expect(viewModel.icsAppointmentTable.rows[0][0].text).toContain('28 March 2026 at 10:00am')
    expect(viewModel.icsAppointmentTable.rows[0][1].html).toContain('Scheduled')
    expect(viewModel.icsAppointmentTable.rows[0][1].html).toContain('govuk-tag--blue')
    expect(viewModel.icsAppointmentTable.rows[0][2].html).toContain('View or change details')
    expect(viewModel.icsAppointmentTable.rows[1][0].text).toContain('27 March 2026 at 10:00am')
    expect(viewModel.icsAppointmentTable.rows[1][1].html).toContain('Completed')
    expect(viewModel.icsAppointmentTable.rows[1][1].html).toContain('govuk-tag--green')
    expect(viewModel.icsAppointmentTable.rows[1][2].html).toContain('View feedback')
  })

  it('renders notification banner if latest appointment is at SCHEDULED status and show notification banner is true', () => {
    const referralProgressWithAppointments = buildReferralProgress([
      {
        appointmentId: randomUUID(),
        events: [
          { status: 'SCHEDULED', dateTime: '2026-03-26T10:00:00' },
          { status: 'NEEDS_FEEDBACK', dateTime: '2026-03-27T10:00:00' },
        ],
      },
      {
        appointmentId: randomUUID(),
        events: [{ status: 'SCHEDULED', dateTime: '2026-03-28T10:00:00' }],
      },
    ])
    const presenter = new ReferralProgressPresenter(referralProgressWithAppointments, caseReference, 'SCHEDULED_ICS')
    const viewModel = presenter.buildPageContent(mockResponse)

    expect(viewModel.notificationBanner?.type).toEqual('success')
    expect(viewModel.notificationBanner?.html).toContain('ICS has been scheduled')
  })

  it('does not render notification banner if show notification banner is false', () => {
    const referralProgressWithAppointments = buildReferralProgress([
      {
        appointmentId: randomUUID(),
        events: [
          { status: 'SCHEDULED', dateTime: '2026-03-26T10:00:00' },
          { status: 'NEEDS_FEEDBACK', dateTime: '2026-03-27T10:00:00' },
        ],
      },
      {
        appointmentId: randomUUID(),
        events: [{ status: 'SCHEDULED', dateTime: '2026-03-28T10:00:00' }],
      },
    ])
    const presenter = new ReferralProgressPresenter(referralProgressWithAppointments, caseReference, undefined)
    const viewModel = presenter.buildPageContent(mockResponse)

    expect(viewModel.notificationBanner).toBeUndefined()
  })

  it('renders SCHEDULED appointment correctly and should display notification banner', () => {
    const referralProgressWithAppointments = buildReferralProgress([
      {
        appointmentId: randomUUID(),
        events: [{ status: 'SCHEDULED', dateTime: '2026-03-27T13:00:00' }],
      },
    ])
    const presenter = new ReferralProgressPresenter(referralProgressWithAppointments, caseReference, 'SCHEDULED_ICS')
    const viewModel = presenter.buildPageContent(mockResponse)

    expect(viewModel.icsAppointmentTable.head).toEqual([
      { text: 'Date and time' },
      { text: 'Status' },
      { text: 'Action' },
    ])
    expect(viewModel.notificationBanner?.html).toContain('ICS has been scheduled')
    expect(viewModel.icsAppointmentTable.rows[0][0].text).toBe('27 March 2026 at 1:00pm')
    expect(viewModel.icsAppointmentTable.rows[0][1].html).toContain('Scheduled')
    expect(viewModel.icsAppointmentTable.rows[0][1].html).toContain('govuk-tag--blue')
    expect(viewModel.icsAppointmentTable.rows[0][2].html).toContain('View or change details')
  })

  it('renders NEEDS_FEEDBACK action correctly and should not display notification banner', () => {
    const referralProgressWithAppointments = buildReferralProgress([
      {
        appointmentId: randomUUID(),
        events: [
          { status: 'SCHEDULED', dateTime: '2026-03-25T10:00:00' },
          { status: 'NEEDS_FEEDBACK', dateTime: '2026-03-27T10:00:00' },
        ],
      },
    ])
    const presenter = new ReferralProgressPresenter(referralProgressWithAppointments, caseReference)
    const viewModel = presenter.buildPageContent(mockResponse)

    expect(viewModel.notificationBanner).toBeUndefined()
    expect(viewModel.icsAppointmentTable.rows[0][0].text).toContain('27 March 2026 at 10:00am')
    expect(viewModel.icsAppointmentTable.rows[0][1].html).toContain('Needs feedback')
    expect(viewModel.icsAppointmentTable.rows[0][1].html).toContain('govuk-tag--red')
    expect(viewModel.icsAppointmentTable.rows[0][2].html).toContain('Add attendance and feedback')
  })

  it('renders COMPLETED action correctly and should not display notification banner', () => {
    const referralProgressWithAppointments = buildReferralProgress([
      {
        appointmentId: randomUUID(),
        events: [
          { status: 'SCHEDULED', dateTime: '2026-03-25T10:00:00' },
          { status: 'NEEDS_FEEDBACK', dateTime: '2026-03-26T10:00:00' },
          { status: 'COMPLETED', dateTime: '2026-03-27T10:00:00' },
        ],
      },
    ])
    const presenter = new ReferralProgressPresenter(referralProgressWithAppointments, caseReference)
    const viewModel = presenter.buildPageContent(mockResponse)

    expect(viewModel.notificationBanner).toBeUndefined()
    expect(viewModel.icsAppointmentTable.rows[0][0].text).toContain('27 March 2026 at 10:00am')
    expect(viewModel.icsAppointmentTable.rows[0][1].html).toContain('Completed')
    expect(viewModel.icsAppointmentTable.rows[0][1].html).toContain('govuk-tag--green')
    expect(viewModel.icsAppointmentTable.rows[0][2].html).toContain('View feedback')
  })

  it('renders DID_NOT_HAPPEN correctly', () => {
    const referralProgressWithAppointments = buildReferralProgress([
      {
        appointmentId: randomUUID(),
        events: [
          { status: 'SCHEDULED', dateTime: '2026-03-25T10:00:00' },
          { status: 'NEEDS_FEEDBACK', dateTime: '2026-03-26T10:00:00' },
          { status: 'DID_NOT_HAPPEN', dateTime: '2026-03-27T10:00:00' },
        ],
      },
    ])
    const presenter = new ReferralProgressPresenter(referralProgressWithAppointments, caseReference)
    const viewModel = presenter.buildPageContent(mockResponse)

    expect(viewModel.notificationBanner).toBeUndefined()
    expect(viewModel.icsAppointmentTable.rows[0][0].text).toContain('27 March 2026 at 10:00am')
    expect(viewModel.icsAppointmentTable.rows[0][1].html).toContain('Did not happen')
    expect(viewModel.icsAppointmentTable.rows[0][1].html).toContain('govuk-tag--purple')
    expect(viewModel.icsAppointmentTable.rows[0][2].html).toContain('Reschedule')
    expect(viewModel.icsAppointmentTable.rows[0][2].html).toContain('View feedback')
  })

  it('renders DID_NOT_ATTEND correctly', () => {
    const referralProgressWithAppointments = buildReferralProgress([
      {
        appointmentId: randomUUID(),
        events: [{ status: 'DID_NOT_ATTEND', dateTime: '2026-03-27T13:00:00' }],
      },
    ])
    const presenter = new ReferralProgressPresenter(referralProgressWithAppointments, caseReference)
    const viewModel = presenter.buildPageContent(mockResponse)

    expect(viewModel.notificationBanner).toBeUndefined()
    expect(viewModel.icsAppointmentTable.rows[0][0].text).toContain('27 March 2026 at 1:00pm')
    expect(viewModel.icsAppointmentTable.rows[0][1].html).toContain('Did not attend')
    expect(viewModel.icsAppointmentTable.rows[0][1].html).toContain('govuk-tag--purple')
    expect(viewModel.icsAppointmentTable.rows[0][2].html).toContain('Reschedule')
    expect(viewModel.icsAppointmentTable.rows[0][2].html).toContain('View feedback')
  })

  it('renders RESCHEDULED correctly', () => {
    const referralProgressWithAppointments = buildReferralProgress([
      {
        appointmentId: randomUUID(),
        events: [{ status: 'RESCHEDULED', dateTime: '2026-03-27T13:00:00' }],
      },
    ])
    const presenter = new ReferralProgressPresenter(referralProgressWithAppointments, caseReference)
    const viewModel = presenter.buildPageContent(mockResponse)

    expect(viewModel.notificationBanner).toBeUndefined()
    expect(viewModel.icsAppointmentTable.rows[0][0].text).toContain('27 March 2026 at 1:00pm')
    expect(viewModel.icsAppointmentTable.rows[0][1].html).toContain('Rescheduled')
    expect(viewModel.icsAppointmentTable.rows[0][1].html).toContain('govuk-tag--grey')
    expect(viewModel.icsAppointmentTable.rows[0][2].html).toContain('View or change details')
  })
})
