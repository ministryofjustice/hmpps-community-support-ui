import path from 'path'
import nunjucks from 'nunjucks'
import { Response } from 'express'
import type { ScheduleIcsContent, ScheduleIcsViewModel, ScheduleFormData } from './scheduleIcsViewModel'
import ScheduleIcsPresenter from './scheduleIcsPresenter'
import ScheduleIcsContentFactory from '../../testutils/factories/ScheduleIcsContent'
import ReferralInformationFactory from '../../testutils/factories/ReferralInformation'
import { probationOfficesData, prisonsData } from '../../../integration_tests/mockData/referenceData'

beforeAll(() => {
  nunjucks.configure([
    path.join(__dirname, '../../views'),
    path.join(process.cwd(), 'node_modules/govuk-frontend/dist/'),
    path.join(process.cwd(), 'node_modules/@ministryofjustice/frontend/'),
  ])
})

describe('ScheduleIcsPresenter', () => {
  let res: Response
  let content: ScheduleIcsContent

  const caseReference = 'AB1234CD'
  const referralInformation = ReferralInformationFactory.build({ crn: 'A123456' })
  const referralInformationNomis = ReferralInformationFactory.build({ crn: 'G1234AB' })

  beforeEach(() => {
    content = ScheduleIcsContentFactory.build()
    res = {
      locals: { content },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response
  })

  function getViewModel(): ScheduleIcsViewModel {
    return (res.render as jest.Mock).mock.calls[0][1].content
  }

  describe('renderPage', () => {
    it('renders the scheduleIcsAppointment template', () => {
      const presenter = new ScheduleIcsPresenter(caseReference, probationOfficesData, prisonsData, referralInformation)
      presenter.renderPage(res)
      expect(res.render).toHaveBeenCalledWith('appointment/scheduleIcsAppointment', expect.objectContaining({}))
    })

    it('includes page header and submit button text from content', () => {
      const presenter = new ScheduleIcsPresenter(caseReference, probationOfficesData, prisonsData, referralInformation)
      presenter.renderPage(res)
      const viewModel = getViewModel()
      expect(viewModel.pageHeader).toBe(content.pageHeader)
      expect(viewModel.submitButtonText).toBe(content.submitButtonText)
    })

    it('sets the correct submitHref and backLink', () => {
      const presenter = new ScheduleIcsPresenter(caseReference, probationOfficesData, prisonsData, referralInformation)
      presenter.renderPage(res)
      const viewModel = getViewModel()
      expect(viewModel.submitHref).toBe(`/referral/${caseReference}/appointment/schedule-ics`)
      expect(viewModel.backLink).toEqual({ href: `/progress/${caseReference}` })
    })

    it('exposes serviceName and firstName from referral information', () => {
      const presenter = new ScheduleIcsPresenter(caseReference, probationOfficesData, prisonsData, referralInformation)
      presenter.renderPage(res)
      const viewModel = getViewModel()
      expect(viewModel.serviceName).toBe(referralInformation.communityServiceProviderName)
      expect(viewModel.firstName).toBe(referralInformation.firstName)
    })

    it('sets isPersonInCommunity to true when the identifier is a CRN', () => {
      const presenter = new ScheduleIcsPresenter(caseReference, probationOfficesData, prisonsData, referralInformation)
      presenter.renderPage(res)
      const viewModel = getViewModel()
      expect(viewModel.isPersonInCommunity).toBe(true)
    })

    it('sets isPersonInCommunity to false when the identifier is a NOMIS number', () => {
      const presenter = new ScheduleIcsPresenter(
        caseReference,
        probationOfficesData,
        prisonsData,
        referralInformationNomis,
      )
      presenter.renderPage(res)
      const viewModel = getViewModel()
      expect(viewModel.isPersonInCommunity).toBe(false)
    })

    it('passes formData through to the view model', () => {
      const formData: ScheduleFormData = { sessionDate: '21/5/2026', sessionTakePlace: 'InProbationOffice' }
      const presenter = new ScheduleIcsPresenter(
        caseReference,
        probationOfficesData,
        prisonsData,
        referralInformation,
        formData,
      )
      presenter.renderPage(res)
      const viewModel = getViewModel()
      expect(viewModel.formData).toEqual(formData)
    })
  })

  describe('probationOfficesSelectItems', () => {
    it('includes a blank default item as the first option', () => {
      const presenter = new ScheduleIcsPresenter(caseReference, probationOfficesData, prisonsData, referralInformation)
      presenter.renderPage(res)
      const { probationOfficesSelectItems } = getViewModel()
      expect(probationOfficesSelectItems[0]).toEqual({ value: '', text: 'Select probation office' })
    })

    it('uses office name as both value and text for each option', () => {
      const presenter = new ScheduleIcsPresenter(caseReference, probationOfficesData, prisonsData, referralInformation)
      presenter.renderPage(res)
      const { probationOfficesSelectItems } = getViewModel()
      const officeItems = probationOfficesSelectItems.slice(1)
      officeItems.forEach((item, index) => {
        expect(item.value).toBe(probationOfficesData[index].name)
        expect(item.text).toBe(probationOfficesData[index].name)
      })
    })

    it('marks the matching office as selected when formData.probationOffice is set', () => {
      const selectedOfficeName = probationOfficesData[1].name
      const formData: ScheduleFormData = { probationOffice: selectedOfficeName }
      const presenter = new ScheduleIcsPresenter(
        caseReference,
        probationOfficesData,
        prisonsData,
        referralInformation,
        formData,
      )
      presenter.renderPage(res)
      const { probationOfficesSelectItems } = getViewModel()
      const selected = probationOfficesSelectItems.filter(item => (item as { selected?: boolean }).selected)
      expect(selected).toHaveLength(1)
      expect(selected[0].value).toBe(selectedOfficeName)
    })

    it('marks no item as selected when formData has no probationOffice', () => {
      const presenter = new ScheduleIcsPresenter(caseReference, probationOfficesData, prisonsData, referralInformation)
      presenter.renderPage(res)
      const { probationOfficesSelectItems } = getViewModel()
      const selected = probationOfficesSelectItems.filter(item => (item as { selected?: boolean }).selected)
      expect(selected).toHaveLength(0)
    })

    it('handles an empty probationOffices array gracefully', () => {
      const presenter = new ScheduleIcsPresenter(caseReference, [], prisonsData, referralInformation)
      presenter.renderPage(res)
      const { probationOfficesSelectItems } = getViewModel()
      expect(probationOfficesSelectItems).toHaveLength(1)
      expect(probationOfficesSelectItems[0].value).toBe('')
    })
  })

  describe('prisonsSelectItems', () => {
    it('includes a blank default item as the first option', () => {
      const presenter = new ScheduleIcsPresenter(caseReference, probationOfficesData, prisonsData, referralInformation)
      presenter.renderPage(res)
      const { prisonsSelectItems } = getViewModel()
      expect(prisonsSelectItems[0]).toEqual({ value: '', text: 'Select prison' })
    })

    it('uses agencyId as value and description as text for each option', () => {
      const presenter = new ScheduleIcsPresenter(caseReference, probationOfficesData, prisonsData, referralInformation)
      presenter.renderPage(res)
      const { prisonsSelectItems } = getViewModel()
      const prisonItems = prisonsSelectItems.slice(1)
      prisonItems.forEach((item, index) => {
        expect(item.value).toBe(prisonsData[index].agencyId)
        expect(item.text).toBe(prisonsData[index].description)
      })
    })

    it('marks the matching prison as selected when formData.prison is set', () => {
      const selectedAgencyId = prisonsData[0].agencyId
      const formData: ScheduleFormData = { prison: selectedAgencyId }
      const presenter = new ScheduleIcsPresenter(
        caseReference,
        probationOfficesData,
        prisonsData,
        referralInformation,
        formData,
      )
      presenter.renderPage(res)
      const { prisonsSelectItems } = getViewModel()
      const selected = prisonsSelectItems.filter(item => (item as { selected?: boolean }).selected)
      expect(selected).toHaveLength(1)
      expect(selected[0].value).toBe(selectedAgencyId)
    })

    it('handles an empty prisons array gracefully', () => {
      const presenter = new ScheduleIcsPresenter(caseReference, probationOfficesData, [], referralInformation)
      presenter.renderPage(res)
      const { prisonsSelectItems } = getViewModel()
      expect(prisonsSelectItems).toHaveLength(1)
      expect(prisonsSelectItems[0].value).toBe('')
    })
  })
})
