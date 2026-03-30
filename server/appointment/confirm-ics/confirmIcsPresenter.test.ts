import { Response } from 'express'
import { CreateAppointmentRequest } from '@community-support-api'
import type { ConfirmIcsContent, ConfirmIcsViewModel } from './confirmIcsViewModel'
import ConfirmIcsPresenter from './confirmIcsPresenter'
import ConfirmIcsContentFactory from '../../testutils/factories/ConfirmIcsContent'

function addDays(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d
}

function toIsoDateString(d: Date): string {
  return d.toISOString().split('T')[0]
}

function toDisplayDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

const futureDate = addDays(7)
const futureDateStr = toIsoDateString(futureDate)
const futureDateDisplay = toDisplayDate(futureDate)

describe('ConfirmIcsPresenter', () => {
  let res: Response
  let content: ConfirmIcsContent

  const referralId = 'referral-123'

  const baseRequest: CreateAppointmentRequest = {
    date: futureDateStr,
    time: { hour: 1, minute: 0, amPm: 'pm' },
    sessionMethodRequest: {
      type: 'PHONE',
      additionalDetails: 'The referral is not well, so a phone call is necessary.',
    },
    sessionCommunication: ['Phone call'],
  }

  beforeEach(() => {
    content = ConfirmIcsContentFactory.build()
    res = {
      locals: { content },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response
  })

  describe('renderPage', () => {
    it('should render the confirm ICS page with correct template', () => {
      const presenter = new ConfirmIcsPresenter(baseRequest, referralId)
      presenter.renderPage(res)
      expect(res.render).toHaveBeenCalledWith('appointment/confirmIcs', expect.objectContaining({}))
    })

    it('should include the page header and submit button text from content', () => {
      const presenter = new ConfirmIcsPresenter(baseRequest, referralId)
      presenter.renderPage(res)
      expect(res.render).toHaveBeenCalledWith(
        'appointment/confirmIcs',
        expect.objectContaining({
          content: expect.objectContaining<Partial<ConfirmIcsViewModel>>({
            pageHeader: content.pageHeader,
            submitButtonText: content.submitButtonText,
          }),
        }),
      )
    })

    it('should include the correct submit and backlink href', () => {
      const presenter = new ConfirmIcsPresenter(baseRequest, referralId)
      presenter.renderPage(res)
      expect(res.render).toHaveBeenCalledWith(
        'appointment/confirmIcs',
        expect.objectContaining({
          content: expect.objectContaining<Partial<ConfirmIcsViewModel>>({
            submitHref: `/referral/${referralId}/appointment/submit-ics`,
            backlinkHref: `/referral/${referralId}/appointment/schedule-ics`,
          }),
        }),
      )
    })

    it('should build the ICS details summary with formatted date and time', () => {
      const presenter = new ConfirmIcsPresenter(baseRequest, referralId)
      presenter.renderPage(res)

      const renderCall = (res.render as jest.Mock).mock.calls[0]
      const viewModel: ConfirmIcsViewModel = renderCall[1].content
      const { rows } = viewModel.icsDetailsSummary

      expect(rows[0]).toEqual({ key: { text: 'Date' }, value: { text: futureDateDisplay } })
      expect(rows[1]).toEqual({ key: { text: 'Start time' }, value: { text: '1:00pm' } })
    })

    it('should format the session method as a display string', () => {
      const presenter = new ConfirmIcsPresenter(baseRequest, referralId)
      presenter.renderPage(res)

      const renderCall = (res.render as jest.Mock).mock.calls[0]
      const viewModel: ConfirmIcsViewModel = renderCall[1].content
      const { rows } = viewModel.icsDetailsSummary

      expect(rows[2]).toEqual({ key: { text: 'Method' }, value: { text: 'Phone call' } })
    })

    it('should include reason session is not in-person when method is not PROBATION_OFFICE', () => {
      const presenter = new ConfirmIcsPresenter(baseRequest, referralId)
      presenter.renderPage(res)

      const renderCall = (res.render as jest.Mock).mock.calls[0]
      const viewModel: ConfirmIcsViewModel = renderCall[1].content
      const { rows } = viewModel.icsDetailsSummary

      expect(rows[3]).toEqual({
        key: { text: 'Reason session is not in-person' },
        value: { text: 'The referral is not well, so a phone call is necessary.' },
      })
    })

    it('should not include reason session is not in-person when method is PROBATION_OFFICE', () => {
      const inPersonRequest: CreateAppointmentRequest = {
        ...baseRequest,
        sessionMethodRequest: { type: 'PROBATION_OFFICE' },
      }
      const presenter = new ConfirmIcsPresenter(inPersonRequest, referralId)
      presenter.renderPage(res)

      const renderCall = (res.render as jest.Mock).mock.calls[0]
      const viewModel: ConfirmIcsViewModel = renderCall[1].content
      const { rows } = viewModel.icsDetailsSummary

      const reasonRow = rows.find(row => row.key.text === 'Reason session is not in-person')
      expect(reasonRow).toBeUndefined()
    })

    it('should include how the person was informed about the session', () => {
      const presenter = new ConfirmIcsPresenter(baseRequest, referralId)
      presenter.renderPage(res)

      const renderCall = (res.render as jest.Mock).mock.calls[0]
      const viewModel: ConfirmIcsViewModel = renderCall[1].content
      const lastRow = viewModel.icsDetailsSummary.rows.at(-1)

      expect(lastRow).toEqual({
        key: { text: 'How the person was informed about the session' },
        value: { text: 'Phone call' },
      })
    })

    it('should include a Change action link in the ICS details card', () => {
      const presenter = new ConfirmIcsPresenter(baseRequest, referralId)
      presenter.renderPage(res)

      const renderCall = (res.render as jest.Mock).mock.calls[0]
      const viewModel: ConfirmIcsViewModel = renderCall[1].content
      const { card } = viewModel.icsDetailsSummary

      expect(card?.actions?.items?.[0]).toMatchObject({
        href: `/referral/${referralId}/appointment/schedule-ics`,
        text: 'Change',
      })
    })

    describe('location row for in-person sessions', () => {
      it('should include Location row with "Probation office" when method is PROBATION_OFFICE', () => {
        const inPersonRequest: CreateAppointmentRequest = {
          ...baseRequest,
          sessionMethodRequest: { type: 'PROBATION_OFFICE' },
        }
        const presenter = new ConfirmIcsPresenter(inPersonRequest, referralId)
        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel: ConfirmIcsViewModel = renderCall[1].content
        const locationRow = viewModel.icsDetailsSummary.rows.find(row => row.key.text === 'Location')

        expect(locationRow).toEqual({ key: { text: 'Location' }, value: { text: 'Probation office' } })
      })

      it('should include Location row with formatted address when method is OTHER_LOCATION', () => {
        const otherLocationRequest: CreateAppointmentRequest = {
          ...baseRequest,
          sessionMethodRequest: {
            type: 'OTHER_LOCATION',
            addressLine1: '123 Main Street',
            addressLine2: 'Flat 4',
            townOrCity: 'Leeds',
            county: 'West Yorkshire',
            postcode: 'LS1 1AA',
          },
        }
        const presenter = new ConfirmIcsPresenter(otherLocationRequest, referralId)
        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel: ConfirmIcsViewModel = renderCall[1].content
        const locationRow = viewModel.icsDetailsSummary.rows.find(row => row.key.text === 'Location')

        expect(locationRow).toEqual({
          key: { text: 'Location' },
          value: { html: '123 Main Street<br>Flat 4<br>Leeds<br>West Yorkshire<br>LS1 1AA' },
        })
      })

      it('should omit blank address fields in Location row for OTHER_LOCATION', () => {
        const otherLocationRequest: CreateAppointmentRequest = {
          ...baseRequest,
          sessionMethodRequest: {
            type: 'OTHER_LOCATION',
            addressLine1: '123 Main Street',
            townOrCity: 'Leeds',
            postcode: 'LS1 1AA',
          },
        }
        const presenter = new ConfirmIcsPresenter(otherLocationRequest, referralId)
        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel: ConfirmIcsViewModel = renderCall[1].content
        const locationRow = viewModel.icsDetailsSummary.rows.find(row => row.key.text === 'Location')

        expect(locationRow).toEqual({
          key: { text: 'Location' },
          value: { html: '123 Main Street<br>Leeds<br>LS1 1AA' },
        })
      })

      it('should not include a Location row for non-in-person sessions', () => {
        const presenter = new ConfirmIcsPresenter(baseRequest, referralId)
        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel: ConfirmIcsViewModel = renderCall[1].content
        const locationRow = viewModel.icsDetailsSummary.rows.find(row => row.key.text === 'Location')

        expect(locationRow).toBeUndefined()
      })
    })

    describe('notification banner for past appointments', () => {
      it('should include a notification banner when the appointment date and time is in the past', () => {
        const pastRequest: CreateAppointmentRequest = {
          ...baseRequest,
          date: '2020-01-01',
          time: { hour: 9, minute: 0, amPm: 'am' },
        }
        const presenter = new ConfirmIcsPresenter(pastRequest, referralId)
        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel: ConfirmIcsViewModel = renderCall[1].content

        expect(viewModel.notificationBanner).toBeDefined()
        expect(viewModel.notificationBanner?.html).toContain("You've chosen a date and time in the past")
        expect(viewModel.notificationBanner?.html).toContain('you must add the attendance feedback next')
        expect(viewModel.notificationBanner?.html).toContain('select change and enter the correct information')
      })

      it('should not include a notification banner when the appointment date and time is in the future', () => {
        const futureRequest: CreateAppointmentRequest = {
          ...baseRequest,
          date: '2099-12-31',
          time: { hour: 11, minute: 59, amPm: 'pm' },
        }
        const presenter = new ConfirmIcsPresenter(futureRequest, referralId)
        presenter.renderPage(res)

        const renderCall = (res.render as jest.Mock).mock.calls[0]
        const viewModel: ConfirmIcsViewModel = renderCall[1].content

        expect(viewModel.notificationBanner).toBeUndefined()
      })
    })
  })
})
