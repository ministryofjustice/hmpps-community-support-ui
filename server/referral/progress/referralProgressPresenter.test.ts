import { randomUUID } from 'crypto'
import { Response } from 'express'
import { ReferralProgress } from '@community-support-api'
import { ReferralProgressContent } from './referralProgressViewModel'
import ReferralProgressPresenter from './referralProgressPresenter'
import buildReferralProgress from '../../testutils/buildReferralProgress'
import { ReferralProgressBannerContent } from './ReferralProgressBannerContent'

describe('ReferralProgressPresenter', () => {
  function daysAfter(base: Date, days: number, hour: number = 10): string {
    const d = new Date(base)
    d.setDate(d.getDate() + days)
    d.setHours(hour, 0, 0, 0)
    return d.toISOString()
  }

  const baseDate = new Date('2026-03-25T10:00:00')
  const caseReference = 'AB1234CD'

  const mockContent: ReferralProgressContent = {
    pageHeader: 'Referral for',
    progressSubNavTitle: 'Progress',
    subNavItems: [],
    progressActiveColumnHeaders: ['Date and time', 'Status', 'Action'],
    progressInactiveColumnHeaders: ['Status', 'Action'],
  }

  const mockResponse = { locals: { content: mockContent } } as unknown as Response

  const statusLabel = {
    DID_NOT_HAPPEN: 'Did not happen',
    DID_NOT_ATTEND: 'Did not attend',
  }

  const scheduledIcsSessionBannerContent: ReferralProgressBannerContent = {
    heading: 'ICS scheduled',
    body: 'The ICS has been scheduled for 27 March 2026 at 1:00pm',
  }

  const rescheduleIcsSessionBannerContent: ReferralProgressBannerContent = {
    heading: 'Session feedback submitted',
    body: 'You must now reschedule the ICS.',
  }

  const completedIcsSessionBannerContent: ReferralProgressBannerContent = {
    heading: 'Session feedback submitted',
    body: 'The ICS is now complete. The probation practitioner will receive an email.',
  }

  describe('when no appointments exist', () => {
    it('renders NOT SCHEDULED table correctly', () => {
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
  })

  describe('appointment table rendering', () => {
    it('renders one row per appointmentId and sorts by latest date descending', () => {
      const referralProgressWithAppointments = buildReferralProgress([
        {
          appointmentId: randomUUID(),
          events: [
            { status: 'SCHEDULED', dateTime: daysAfter(baseDate, 0) },
            { status: 'NEEDS_FEEDBACK', dateTime: daysAfter(baseDate, 1) },
            { status: 'COMPLETED', dateTime: daysAfter(baseDate, 2) },
          ],
        },
        {
          appointmentId: randomUUID(),
          events: [{ status: 'SCHEDULED', dateTime: daysAfter(baseDate, 3) }],
        },
      ])

      const presenter = new ReferralProgressPresenter(referralProgressWithAppointments, caseReference)
      const viewModel = presenter.buildPageContent(mockResponse)

      expect(viewModel.icsAppointmentTable.rows).toHaveLength(2)

      expect(viewModel.icsAppointmentTable.rows[0][0].text).toContain('28 March 2026 at 10:00am')
      expect(viewModel.icsAppointmentTable.rows[0][1].html).toContain('Scheduled')

      expect(viewModel.icsAppointmentTable.rows[1][0].text).toContain('27 March 2026 at 10:00am')
      expect(viewModel.icsAppointmentTable.rows[1][1].html).toContain('Completed')
    })
  })

  describe('scheduled ICS banner', () => {
    it('shows scheduled ICS success banner', () => {
      const referralProgressWithAppointments = buildReferralProgress([
        {
          appointmentId: randomUUID(),
          events: [{ status: 'SCHEDULED', dateTime: daysAfter(baseDate, 1) }],
        },
      ])

      const presenter = new ReferralProgressPresenter(
        referralProgressWithAppointments,
        caseReference,
        scheduledIcsSessionBannerContent,
      )

      const viewModel = presenter.buildPageContent(mockResponse)

      expect(viewModel.notificationBanner?.type).toEqual('success')
      expect(viewModel.notificationBanner?.html).toContain('ICS has been scheduled')
    })
  })

  describe('reschedule ICS banner', () => {
    const scenarios = [
      { name: 'did not happen', finalStatus: 'DID_NOT_HAPPEN' as const },
      { name: 'did not attend', finalStatus: 'DID_NOT_ATTEND' as const },
    ]

    for (const scenario of scenarios) {
      it(`shows reschedule ICS banner after ${scenario.name}`, () => {
        const referralProgressWithAppointments = buildReferralProgress([
          {
            appointmentId: randomUUID(),
            events: [
              { status: 'SCHEDULED', dateTime: daysAfter(baseDate, 1) },
              { status: 'NEEDS_FEEDBACK', dateTime: daysAfter(baseDate, 2) },
              { status: scenario.finalStatus, dateTime: daysAfter(baseDate, 3) },
            ],
          },
        ])

        const presenter = new ReferralProgressPresenter(
          referralProgressWithAppointments,
          caseReference,
          rescheduleIcsSessionBannerContent,
        )

        const viewModel = presenter.buildPageContent(mockResponse)

        expect(viewModel.notificationBanner?.type).toEqual('success')
        expect(viewModel.notificationBanner?.html).toContain('Session feedback submitted')
        expect(viewModel.notificationBanner?.html).toContain('You must now reschedule the ICS.')
      })
    }
  })

  describe('completed ICS banner', () => {
    it('shows completed ICS success banner', () => {
      const referralProgressWithAppointments = buildReferralProgress([
        {
          appointmentId: randomUUID(),
          events: [
            { status: 'SCHEDULED', dateTime: daysAfter(baseDate, 1) },
            { status: 'NEEDS_FEEDBACK', dateTime: daysAfter(baseDate, 2) },
            { status: 'COMPLETED', dateTime: daysAfter(baseDate, 3) },
          ],
        },
      ])

      const presenter = new ReferralProgressPresenter(
        referralProgressWithAppointments,
        caseReference,
        completedIcsSessionBannerContent,
      )

      const viewModel = presenter.buildPageContent(mockResponse)

      expect(viewModel.notificationBanner?.type).toEqual('success')
      expect(viewModel.notificationBanner?.html).toContain('Session feedback submitted')
      expect(viewModel.notificationBanner?.html).toContain(
        'The ICS is now complete. The probation practitioner will receive an email.',
      )
    })
  })

  describe('appointment status rendering', () => {
    const scenarios = [
      {
        name: 'did not happen',
        finalStatus: 'DID_NOT_HAPPEN' as const,
        hour: 10,
      },
      {
        name: 'did not attend',
        finalStatus: 'DID_NOT_ATTEND' as const,
        hour: 13,
      },
    ]

    for (const scenario of scenarios) {
      it(`renders ${scenario.name} correctly`, () => {
        const referralProgressWithAppointments = buildReferralProgress([
          {
            appointmentId: randomUUID(),
            events: [
              { status: 'SCHEDULED', dateTime: daysAfter(baseDate, 0) },
              { status: 'NEEDS_FEEDBACK', dateTime: daysAfter(baseDate, 1) },
              { status: scenario.finalStatus, dateTime: daysAfter(baseDate, 2, scenario.hour) },
            ],
          },
        ])

        const presenter = new ReferralProgressPresenter(referralProgressWithAppointments, caseReference)
        const viewModel = presenter.buildPageContent(mockResponse)

        expect(viewModel.notificationBanner).toBeUndefined()
        expect(viewModel.icsAppointmentTable.rows[0][1].html).toContain(statusLabel[scenario.finalStatus])
      })
    }
  })
})
