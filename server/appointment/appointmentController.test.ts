import { Request, Response } from 'express'
import { CreateAppointmentRequest, ReferralInformation } from '@community-support-api'
import AppointmentController from './appointmentController'
import ConfirmIcsPresenter from './confirm-ics/confirmIcsPresenter'
import ScheduleIcsPresenter from './schedule-ics/scheduleIcsPresenter'
import ConfirmIcsContentFactory from '../testutils/factories/ConfirmIcsContent'
import AppointmentService from '../services/AppointmentService'
import CommunitySupportApiClient from '../data/communitySupportApiClient'
import ScheduleIcsContentFactory from '../testutils/factories/ScheduleIcsContent'
import ReferenceDataService from '../services/referenceDataService'
import { prisonsData, probationOfficesData } from '../../integration_tests/mockData/referenceData'

jest.mock('./confirm-ics/confirmIcsPresenter')
jest.mock('../services/AppointmentService')
jest.mock('./schedule-ics/scheduleIcsPresenter')
jest.mock('../services/referenceDataService')

describe('AppointmentController', () => {
  let appointmentService: AppointmentService
  let appointmentController: AppointmentController
  let req: Request
  let res: Response
  let scheduleIcsCommunityReq: Request
  let scheduleIcsPrisonReq: Request
  let scheduleIcsRes: Response
  let referenceDataService: jest.Mocked<ReferenceDataService>

  const mockReferralId = crypto.randomUUID()
  const mockPersonId = crypto.randomUUID()
  const mockServiceProviderId = crypto.randomUUID()

  const referralId = mockReferralId

  const mockCreateAppointmentRequest: CreateAppointmentRequest = {
    date: '2026-03-27',
    time: { hour: 1, minute: 0, amPm: 'pm' },
    sessionMethodRequest: { type: 'PHONE', additionalDetails: 'Lorem ipsum dolor sit amet.' },
    sessionCommunication: ['Phone call'],
  }

  const mockReferralInformationInCommunity: ReferralInformation = {
    crn: 'A123456', // crn number
    firstName: 'John',
    lastName: 'Doe',
    sex: 'Male',
    referralId: mockReferralId,
    personId: mockPersonId,
    communityServiceProviderId: mockServiceProviderId,
    communityServiceProviderName: 'Community Support Provider',
    region: 'North West',
    deliveryPartner: 'Delivery Partner Ltd',
  }

  const mockReferralInformationInPrison: ReferralInformation = {
    crn: 'A1234AA', // prison number
    firstName: 'Alex',
    lastName: 'Joe',
    sex: 'Male',
    referralId: mockReferralId,
    personId: mockPersonId,
    communityServiceProviderId: mockServiceProviderId,
    communityServiceProviderName: 'Community Support Provider',
    region: 'North West',
    deliveryPartner: 'Delivery Partner Ltd',
  }

  beforeEach(() => {
    referenceDataService = {
      getProbationOffices: jest.fn().mockResolvedValue([]),
      getPrisons: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<ReferenceDataService>
    ;(ReferenceDataService as jest.MockedClass<typeof ReferenceDataService>).mockImplementation(
      () => referenceDataService,
    )

    referenceDataService.getProbationOffices.mockResolvedValue(probationOfficesData)
    referenceDataService.getPrisons.mockResolvedValue(prisonsData)
    const communitySupportApiClient = {} as unknown as CommunitySupportApiClient
    appointmentService = new AppointmentService(communitySupportApiClient)
    appointmentController = new AppointmentController(appointmentService, referenceDataService)

    ConfirmIcsPresenter.prototype.renderPage = jest.fn()

    req = {
      params: { referralId },
      session: { createAppointmentRequest: null },
      flash: jest.fn(),
    } as unknown as Request

    res = {
      locals: { content: ConfirmIcsContentFactory.build() },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response

    ScheduleIcsPresenter.prototype.renderPage = jest.fn()

    scheduleIcsCommunityReq = {
      params: {
        referralId,
        probationOfficesData,
        prisonsData,
        mockReferralInformationInCommunity,
        formData: {},
      },
      session: { referralInformation: mockReferralInformationInCommunity, createAppointmentRequest: null },
      flash: jest.fn(),
    } as unknown as Request

    scheduleIcsPrisonReq = {
      params: {
        referralId,
        probationOfficesData,
        prisonsData,
        mockReferralInformationInPrison,
        formData: {},
      },
      session: { referralInformation: mockReferralInformationInPrison, createAppointmentRequest: null },
      flash: jest.fn(),
    } as unknown as Request

    scheduleIcsRes = {
      locals: { content: ScheduleIcsContentFactory.build() },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response
  })

  describe('checkIcs', () => {
    it('should redirect to schedule-ics page when createAppointmentRequest is not in session', async () => {
      await appointmentController.checkIcs(req, res)
      expect(res.redirect).toHaveBeenCalledWith(`/referral/${referralId}/appointment/schedule-ics`)
    })

    it('should create presenter with createAppointmentRequest from session and render page', async () => {
      req.session.createAppointmentRequest = mockCreateAppointmentRequest

      await appointmentController.checkIcs(req, res)

      expect(ConfirmIcsPresenter).toHaveBeenCalledWith(mockCreateAppointmentRequest, referralId)
      expect(ConfirmIcsPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })
  })

  describe('scheduleIcs', () => {
    it('should render schedule-ics page - community ', async () => {
      req.session.referralInformation = mockReferralInformationInCommunity
      await appointmentController.scheduleIcs(scheduleIcsCommunityReq, scheduleIcsRes)
      referenceDataService.getProbationOffices.mockResolvedValue(probationOfficesData)
      referenceDataService.getPrisons.mockResolvedValue(prisonsData)

      await appointmentController.scheduleIcs(scheduleIcsCommunityReq, scheduleIcsRes)

      expect(ScheduleIcsPresenter).toHaveBeenCalledWith(
        referralId,
        probationOfficesData,
        prisonsData,
        mockReferralInformationInCommunity,
        expect.any(Object),
      )
      expect(ScheduleIcsPresenter.prototype.renderPage).toHaveBeenCalledWith(scheduleIcsRes)
    })

    it('should render schedule-ics page - custody ', async () => {
      req.session.referralInformation = mockReferralInformationInPrison
      await appointmentController.scheduleIcs(scheduleIcsPrisonReq, scheduleIcsRes)

      expect(ScheduleIcsPresenter).toHaveBeenCalledWith(
        referralId,
        probationOfficesData,
        prisonsData,
        mockReferralInformationInPrison,
        expect.any(Object),
      )
      expect(ScheduleIcsPresenter.prototype.renderPage).toHaveBeenCalledWith(scheduleIcsRes)
    })

    it('should create presenter with createAppointmentRequest from session and render page', async () => {
      req.session.referralInformation = mockReferralInformationInCommunity
      req.session.createAppointmentRequest = mockCreateAppointmentRequest

      await appointmentController.scheduleIcs(scheduleIcsCommunityReq, scheduleIcsRes)

      expect(ScheduleIcsPresenter).toHaveBeenCalledWith(
        referralId,
        probationOfficesData,
        prisonsData,
        mockReferralInformationInCommunity,
        expect.any(Object),
      )
      expect(ScheduleIcsPresenter.prototype.renderPage).toHaveBeenCalledWith(scheduleIcsRes)
    })
  })
})
