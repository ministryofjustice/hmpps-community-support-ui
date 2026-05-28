import path from 'path'
import nunjucks from 'nunjucks'
import { Response } from 'express'
import { SessionMethod } from '@community-support-api'
import type {
  IcsFeedbackHowSessionTookPlaceContent,
  IcsFeedbackHowSessionTookPlaceViewModel,
} from './icsFeedbackHowSessionTookPlaceViewModel'
import IcsFeedbackHowSessionTookPlacePresenter from './icsFeedbackHowSessionTookPlacePresenter'
import IcsFeedbackContentFactory from '../../testutils/factories/IcsFeedbackContent'
import { probationOfficesData } from '../../../integration_tests/mockData/referenceData'

beforeAll(() => {
  nunjucks.configure([
    path.join(__dirname, '../../views'),
    path.join(process.cwd(), 'node_modules/govuk-frontend/dist/'),
    path.join(process.cwd(), 'node_modules/@ministryofjustice/frontend/'),
  ])
})

describe('IcsFeedbackPresenter', () => {
  let res: Response
  let content: IcsFeedbackHowSessionTookPlaceContent

  beforeEach(() => {
    content = IcsFeedbackContentFactory.build()
    res = {
      locals: { content },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response
  })

  const caseRefId = 'ics-test-123'
  const sessionMethod: SessionMethod = { type: 'PHONE', appointmentCategory: 'VIRTUAL' }

  describe('renderPage', () => {
    it('renders the ics-feedback template', () => {
      const presenter = new IcsFeedbackHowSessionTookPlacePresenter(caseRefId, sessionMethod, probationOfficesData)
      presenter.renderPage(res)
      expect(res.render).toHaveBeenCalledWith('appointment/icsFeedback', expect.objectContaining({}))
    })

    it('includes page header and submit button text from content', () => {
      const presenter = new IcsFeedbackHowSessionTookPlacePresenter(caseRefId, sessionMethod, probationOfficesData)
      presenter.renderPage(res)
      expect(res.render).toHaveBeenCalledWith(
        'appointment/icsFeedback',
        expect.objectContaining({
          content: expect.objectContaining<Partial<IcsFeedbackHowSessionTookPlaceViewModel>>({
            pageHeader: 'Did the session take place by phone call?',
            submitButtonText: content.submitButtonText,
          }),
        }),
      )
    })

    it.each([
      ['PHONE', 'VIRTUAL', 'Did the session take place by phone call?'],
      ['VIDEO', 'VIRTUAL', 'Did the session take place by video call?'],
      ['IN_PERSON_PROBATION_OFFICE', 'IN_PERSON', 'Did the session take place in person at this location?'],
      ['IN_PERSON_OTHER_LOCATION', 'IN_PERSON', 'Did the session take place in person at this location?'],
    ])('builds correct pageHeader for sessionMethodType %s', (type, appointmentCategory, expectedHeader) => {
      const sm = { type, appointmentCategory } as SessionMethod
      const presenter = new IcsFeedbackHowSessionTookPlacePresenter(caseRefId, sm, probationOfficesData)
      presenter.renderPage(res)
      const viewModel: IcsFeedbackHowSessionTookPlaceViewModel = (res.render as jest.Mock).mock.calls[0][1].content
      expect(viewModel.pageHeader).toBe(expectedHeader)
    })

    it('includes correct submit and backlink hrefs', () => {
      const presenter = new IcsFeedbackHowSessionTookPlacePresenter(caseRefId, sessionMethod, probationOfficesData)
      presenter.renderPage(res)
      expect(res.render).toHaveBeenCalledWith(
        'appointment/icsFeedback',
        expect.objectContaining({
          content: expect.objectContaining<Partial<IcsFeedbackHowSessionTookPlaceViewModel>>({
            submitHref: `/ics-feedback/${caseRefId}/did-session-take-place`,
            backLink: { href: `/ics-feedback/${caseRefId}/attendance` },
          }),
        }),
      )
    })

    it('builds didSessionTakePlaceRadiosArgs that returns yes/no items', () => {
      const presenter = new IcsFeedbackHowSessionTookPlacePresenter(caseRefId, sessionMethod, probationOfficesData)
      presenter.renderPage(res)
      const viewModel: IcsFeedbackHowSessionTookPlaceViewModel = (res.render as jest.Mock).mock.calls[0][1].content
      const radios = viewModel.didSessionTakePlaceRadiosArgs('<div>how session html</div>')
      expect(radios.name).toBe('didSessionTakePlaceAsPlanned')
      expect(radios.items).toHaveLength(2)
      expect(radios.items[0].value).toBe('yes')
      expect(radios.items[1].value).toBe('no')
    })

    it('sets checked state on didSessionTakePlaceRadiosArgs items from formData', () => {
      const formData = {
        didSessionTakePlaceAsPlanned: 'no',
        howSessionTookPlace: 'VIDEO',
        videoCallReason: 'Remote access only',
      }
      const presenter = new IcsFeedbackHowSessionTookPlacePresenter(
        caseRefId,
        sessionMethod,
        probationOfficesData,
        formData,
      )
      presenter.renderPage(res)
      const viewModel: IcsFeedbackHowSessionTookPlaceViewModel = (res.render as jest.Mock).mock.calls[0][1].content
      const radios = viewModel.didSessionTakePlaceRadiosArgs('<div>how session html</div>')
      expect(radios.items[0].checked).toBe(false)
      expect(radios.items[1].checked).toBe(true)
    })

    it('excludes the current sessionMethodType from howSessionRadiosArgs items', () => {
      const sm: SessionMethod = { type: 'PHONE', appointmentCategory: 'VIRTUAL' }
      const presenter = new IcsFeedbackHowSessionTookPlacePresenter(caseRefId, sm, probationOfficesData)
      presenter.renderPage(res)
      const viewModel: IcsFeedbackHowSessionTookPlaceViewModel = (res.render as jest.Mock).mock.calls[0][1].content
      const howSessionRadios = viewModel.howSessionRadiosArgs('<phone/>', '<video/>', '<office/>', '<somewhere/>')
      const itemValues = howSessionRadios.items.map(i => i.value)
      expect(itemValues).not.toContain('PHONE')
      expect(itemValues).toContain('VIDEO')
    })

    it('exposes probationDeliveryUnitSelectArgs with office names in items', () => {
      const presenter = new IcsFeedbackHowSessionTookPlacePresenter(caseRefId, sessionMethod, probationOfficesData)
      presenter.renderPage(res)
      const viewModel: IcsFeedbackHowSessionTookPlaceViewModel = (res.render as jest.Mock).mock.calls[0][1].content
      const selectItems = viewModel.probationDeliveryUnitSelectArgs.items ?? []
      expect(selectItems.some(item => item.text === probationOfficesData[0].name)).toBe(true)
    })

    it('exposes probationDeliveryUnitSelectArgs with blank first option', () => {
      const presenter = new IcsFeedbackHowSessionTookPlacePresenter(caseRefId, sessionMethod, [])
      presenter.renderPage(res)
      const viewModel: IcsFeedbackHowSessionTookPlaceViewModel = (res.render as jest.Mock).mock.calls[0][1].content
      const selectItems = viewModel.probationDeliveryUnitSelectArgs.items ?? []
      expect(selectItems[0].text).toBe('Select probation office')
    })

    it('handles empty probationOffices gracefully', () => {
      const presenter = new IcsFeedbackHowSessionTookPlacePresenter(caseRefId, sessionMethod, [])
      presenter.renderPage(res)
      const renderCall = (res.render as jest.Mock).mock.calls[0]
      const viewModel: IcsFeedbackHowSessionTookPlaceViewModel = renderCall[1].content
      expect(viewModel.didSessionTakePlaceRadiosArgs).toBeDefined()
    })
  })

  describe('sessionLocationLines', () => {
    it('returns empty array for PHONE', () => {
      const sm: SessionMethod = { type: 'PHONE', appointmentCategory: 'VIRTUAL' }
      const presenter = new IcsFeedbackHowSessionTookPlacePresenter(caseRefId, sm, probationOfficesData)
      presenter.renderPage(res)
      const viewModel: IcsFeedbackHowSessionTookPlaceViewModel = (res.render as jest.Mock).mock.calls[0][1].content
      expect(viewModel.sessionLocationLines).toEqual([])
    })

    it('returns empty array for VIDEO', () => {
      const sm: SessionMethod = { type: 'VIDEO', appointmentCategory: 'VIRTUAL' }
      const presenter = new IcsFeedbackHowSessionTookPlacePresenter(caseRefId, sm, probationOfficesData)
      presenter.renderPage(res)
      const viewModel: IcsFeedbackHowSessionTookPlaceViewModel = (res.render as jest.Mock).mock.calls[0][1].content
      expect(viewModel.sessionLocationLines).toEqual([])
    })

    it('returns probationOfficeName for IN_PERSON_PROBATION_OFFICE', () => {
      const sm = {
        type: 'IN_PERSON_PROBATION_OFFICE',
        appointmentCategory: 'IN_PERSON',
        probationOfficeName: 'Manchester Probation Office',
      } as SessionMethod
      const presenter = new IcsFeedbackHowSessionTookPlacePresenter(caseRefId, sm, probationOfficesData)
      presenter.renderPage(res)
      const viewModel: IcsFeedbackHowSessionTookPlaceViewModel = (res.render as jest.Mock).mock.calls[0][1].content
      expect(viewModel.sessionLocationLines).toEqual(['Manchester Probation Office'])
    })

    it('returns empty array for IN_PERSON_PROBATION_OFFICE without probationOfficeName', () => {
      const sm = { type: 'IN_PERSON_PROBATION_OFFICE', appointmentCategory: 'IN_PERSON' } as SessionMethod
      const presenter = new IcsFeedbackHowSessionTookPlacePresenter(caseRefId, sm, probationOfficesData)
      presenter.renderPage(res)
      const viewModel: IcsFeedbackHowSessionTookPlaceViewModel = (res.render as jest.Mock).mock.calls[0][1].content
      expect(viewModel.sessionLocationLines).toEqual([])
    })

    it('returns filtered address lines for IN_PERSON_OTHER_LOCATION', () => {
      const sm = {
        type: 'IN_PERSON_OTHER_LOCATION',
        appointmentCategory: 'IN_PERSON',
        addressLine1: '46 High St',
        addressLine2: '',
        townOrCity: 'St Neots',
        county: 'Cambridgeshire',
        postcode: 'PE19 1JG',
      } as SessionMethod
      const presenter = new IcsFeedbackHowSessionTookPlacePresenter(caseRefId, sm, probationOfficesData)
      presenter.renderPage(res)
      const viewModel: IcsFeedbackHowSessionTookPlaceViewModel = (res.render as jest.Mock).mock.calls[0][1].content
      expect(viewModel.sessionLocationLines).toEqual(['46 High St', 'St Neots', 'Cambridgeshire', 'PE19 1JG'])
    })

    it('omits empty address fields for IN_PERSON_OTHER_LOCATION', () => {
      const sm = {
        type: 'IN_PERSON_OTHER_LOCATION',
        appointmentCategory: 'IN_PERSON',
        addressLine1: '56 Carlisle Road',
        townOrCity: 'London',
        postcode: 'N1 6XE',
      } as SessionMethod
      const presenter = new IcsFeedbackHowSessionTookPlacePresenter(caseRefId, sm, probationOfficesData)
      presenter.renderPage(res)
      const viewModel: IcsFeedbackHowSessionTookPlaceViewModel = (res.render as jest.Mock).mock.calls[0][1].content
      expect(viewModel.sessionLocationLines).toEqual(['56 Carlisle Road', 'London', 'N1 6XE'])
    })
  })
})
