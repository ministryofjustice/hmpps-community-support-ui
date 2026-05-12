import { Response } from 'express'
import { AppointmentIcsResponse } from '@community-support-api'
import { randomUUID } from 'node:crypto'
import ViewChangeSessionDetailsPresenter from './ViewChangeSessionDetailsPresenter'
import type { ViewChangeSessionDetailsViewModel } from './viewChangeSessionDetailsViewModel'

const REFERRAL_ID = randomUUID()
const ICS_ID = randomUUID()

const basePhoneResponse: AppointmentIcsResponse = {
  appointmentIcsId: randomUUID(),
  appointmentId: randomUUID(),
  referralId: REFERRAL_ID,
  appointmentType: 'ICS',
  appointmentDate: '2026-06-15',
  appointmentTime: { hour: 1, minute: 0, amPm: 'pm' },
  appointmentStatus: 'SCHEDULED',
  sessionMethod: {
    appointmentCategory: 'VIRTUAL',
    type: 'PHONE',
    whyNotInPersonReason: 'Client does not have transport.',
  },
  sessionCommunications: ['Phone', 'Text'],
  referralFirstName: 'Alice',
  referralLastName: 'Smith',
  createdAt: '2026-05-01T09:00:00Z',
}

const baseInPersonProbationResponse: AppointmentIcsResponse = {
  ...basePhoneResponse,
  sessionMethod: {
    appointmentCategory: 'IN_PERSON',
    type: 'IN_PERSON_PROBATION_OFFICE',
    probationOfficeName: 'Sheffield Probation Office',
  },
  referralFirstName: 'Carlos',
}

const baseOtherLocationResponse: AppointmentIcsResponse = {
  ...basePhoneResponse,
  sessionMethod: {
    appointmentCategory: 'IN_PERSON',
    type: 'IN_PERSON_OTHER_LOCATION',
    addressLine1: '123 Main Street',
    addressLine2: 'Flat 4',
    townOrCity: 'Leeds',
    county: 'West Yorkshire',
    postcode: 'LS1 1AA',
  },
}

describe('ViewChangeSessionDetailsPresenter', () => {
  let res: Response

  beforeEach(() => {
    res = {
      locals: { content: {} },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response
  })

  describe('renderPage', () => {
    it('should render the view-change session details template', () => {
      const presenter = new ViewChangeSessionDetailsPresenter(basePhoneResponse, REFERRAL_ID, ICS_ID)
      presenter.renderPage(res)
      expect(res.render).toHaveBeenCalledWith('appointment/viewChangeSessionDetails', expect.objectContaining({}))
    })

    it('should include the page header "View session details"', () => {
      const presenter = new ViewChangeSessionDetailsPresenter(basePhoneResponse, REFERRAL_ID, ICS_ID)
      presenter.renderPage(res)
      expect(res.render).toHaveBeenCalledWith(
        'appointment/viewChangeSessionDetails',
        expect.objectContaining({
          content: expect.objectContaining<Partial<ViewChangeSessionDetailsViewModel>>({
            pageHeader: 'View session details',
          }),
        }),
      )
    })

    it('should include the correct back link pointing to the progress page', () => {
      const presenter = new ViewChangeSessionDetailsPresenter(basePhoneResponse, REFERRAL_ID, ICS_ID)
      presenter.renderPage(res)
      expect(res.render).toHaveBeenCalledWith(
        'appointment/viewChangeSessionDetails',
        expect.objectContaining({
          content: expect.objectContaining<Partial<ViewChangeSessionDetailsViewModel>>({
            backlinkHref: `/progress/${REFERRAL_ID}`,
          }),
        }),
      )
    })

    it('should build the ICS details summary with formatted date', () => {
      const presenter = new ViewChangeSessionDetailsPresenter(basePhoneResponse, REFERRAL_ID, ICS_ID)
      presenter.renderPage(res)

      const renderCall = (res.render as jest.Mock).mock.calls[0]
      const viewModel: ViewChangeSessionDetailsViewModel = renderCall[1].content
      const { rows } = viewModel.icsDetailsSummary

      expect(rows[0]).toEqual({ key: { text: 'Date' }, value: { text: '15 June 2026' } })
    })

    it('should build the ICS details summary with formatted time', () => {
      const presenter = new ViewChangeSessionDetailsPresenter(basePhoneResponse, REFERRAL_ID, ICS_ID)
      presenter.renderPage(res)

      const renderCall = (res.render as jest.Mock).mock.calls[0]
      const viewModel: ViewChangeSessionDetailsViewModel = renderCall[1].content
      const { rows } = viewModel.icsDetailsSummary

      expect(rows[1]).toEqual({ key: { text: 'Start time' }, value: { text: '1:00pm' } })
    })

    it('should display "Phone call" for PHONE session method', () => {
      const presenter = new ViewChangeSessionDetailsPresenter(basePhoneResponse, REFERRAL_ID, ICS_ID)
      presenter.renderPage(res)

      const renderCall = (res.render as jest.Mock).mock.calls[0]
      const viewModel: ViewChangeSessionDetailsViewModel = renderCall[1].content
      const { rows } = viewModel.icsDetailsSummary

      expect(rows[2]).toEqual({ key: { text: 'Method' }, value: { text: 'Phone call' } })
    })

    it('should include reason row when session is virtual (PHONE) and reason exists', () => {
      const presenter = new ViewChangeSessionDetailsPresenter(basePhoneResponse, REFERRAL_ID, ICS_ID)
      presenter.renderPage(res)

      const renderCall = (res.render as jest.Mock).mock.calls[0]
      const viewModel: ViewChangeSessionDetailsViewModel = renderCall[1].content
      const { rows } = viewModel.icsDetailsSummary

      expect(rows[3]).toEqual({
        key: { text: 'Reason session is not in-person' },
        value: { text: 'Client does not have transport.' },
      })
    })

    it('should not include reason row when session is in-person', () => {
      const presenter = new ViewChangeSessionDetailsPresenter(baseInPersonProbationResponse, REFERRAL_ID, ICS_ID)
      presenter.renderPage(res)

      const renderCall = (res.render as jest.Mock).mock.calls[0]
      const viewModel: ViewChangeSessionDetailsViewModel = renderCall[1].content
      const reasonRow = viewModel.icsDetailsSummary.rows.find(r => r.key.text === 'Reason session is not in-person')

      expect(reasonRow).toBeUndefined()
    })

    it('should include Location row with "Probation office" for IN_PERSON_PROBATION_OFFICE', () => {
      const presenter = new ViewChangeSessionDetailsPresenter(baseInPersonProbationResponse, REFERRAL_ID, ICS_ID)
      presenter.renderPage(res)

      const renderCall = (res.render as jest.Mock).mock.calls[0]
      const viewModel: ViewChangeSessionDetailsViewModel = renderCall[1].content
      const locationRow = viewModel.icsDetailsSummary.rows.find(r => r.key.text === 'Location')

      expect(locationRow).toEqual({ key: { text: 'Location' }, value: { text: 'Probation office' } })
    })

    it('should include Location row with formatted address for IN_PERSON_OTHER_LOCATION', () => {
      const presenter = new ViewChangeSessionDetailsPresenter(baseOtherLocationResponse, REFERRAL_ID, ICS_ID)
      presenter.renderPage(res)

      const renderCall = (res.render as jest.Mock).mock.calls[0]
      const viewModel: ViewChangeSessionDetailsViewModel = renderCall[1].content
      const locationRow = viewModel.icsDetailsSummary.rows.find(r => r.key.text === 'Location')

      expect(locationRow?.value).toMatchObject({ html: expect.stringContaining('123 Main Street') })
      expect(locationRow?.value).toMatchObject({ html: expect.stringContaining('Leeds') })
      expect(locationRow?.value).toMatchObject({ html: expect.stringContaining('LS1 1AA') })
    })

    it('should not include Location row for virtual sessions', () => {
      const presenter = new ViewChangeSessionDetailsPresenter(basePhoneResponse, REFERRAL_ID, ICS_ID)
      presenter.renderPage(res)

      const renderCall = (res.render as jest.Mock).mock.calls[0]
      const viewModel: ViewChangeSessionDetailsViewModel = renderCall[1].content
      const locationRow = viewModel.icsDetailsSummary.rows.find(r => r.key.text === 'Location')

      expect(locationRow).toBeUndefined()
    })

    it("should include session communication row with person's name", () => {
      const presenter = new ViewChangeSessionDetailsPresenter(basePhoneResponse, REFERRAL_ID, ICS_ID)
      presenter.renderPage(res)

      const renderCall = (res.render as jest.Mock).mock.calls[0]
      const viewModel: ViewChangeSessionDetailsViewModel = renderCall[1].content
      const lastRow = viewModel.icsDetailsSummary.rows.at(-1)

      expect(lastRow?.key.text).toContain('Alice')
      expect(lastRow?.key.text).toContain('was informed about the session')
      expect(lastRow?.value.text).toBe('Phone call, Text message')
    })

    it('should include the card title "ICS details"', () => {
      const presenter = new ViewChangeSessionDetailsPresenter(basePhoneResponse, REFERRAL_ID, ICS_ID)
      presenter.renderPage(res)

      const renderCall = (res.render as jest.Mock).mock.calls[0]
      const viewModel: ViewChangeSessionDetailsViewModel = renderCall[1].content

      expect(viewModel.icsDetailsSummary.card?.title?.text).toBe('ICS details')
    })
  })
})
