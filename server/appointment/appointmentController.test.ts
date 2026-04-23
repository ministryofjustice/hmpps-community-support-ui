import { Request, Response } from 'express'
import { CreateAppointmentRequest } from '@community-support-api'
import AppointmentController from './appointmentController'
import ConfirmIcsPresenter, { type AdditionalInformation } from './confirm-ics/confirmIcsPresenter'
import ScheduleIcsPresenter from './schedule-ics/scheduleIcsPresenter'
import ConfirmIcsContentFactory from '../testutils/factories/ConfirmIcsContent'
import ReferralService from '../services/referralService'
import AppointmentService from '../services/AppointmentService'
import CommunitySupportApiClient from '../data/communitySupportApiClient'
import ScheduleIcsContentFactory from '../testutils/factories/ScheduleIcsContent'
import ReferenceDataService from '../services/referenceDataService'
import { prisonsData, probationOfficesData } from '../../integration_tests/mockData/referenceData'
import {
  referralInformationInCommunity,
  referralInformationInPrison,
} from '../../integration_tests/mockData/referralInformationData'

jest.mock('./confirm-ics/confirmIcsPresenter')
jest.mock('../services/AppointmentService')
jest.mock('./schedule-ics/scheduleIcsPresenter')
jest.mock('../services/referralService')
jest.mock('../services/referenceDataService')

describe('AppointmentController', () => {
  let appointmentService: AppointmentService
  let appointmentController: AppointmentController
  let req: Request
  let res: Response
  let scheduleIcsCommunityReq: Request
  let scheduleIcsPrisonReq: Request
  let scheduleIcsRes: Response
  let referralService: jest.Mocked<ReferralService>
  let referenceDataService: jest.Mocked<ReferenceDataService>

  const mockReferralId = crypto.randomUUID()

  const referralId = mockReferralId

  const mockCreateAppointmentRequest: CreateAppointmentRequest = {
    date: '2026-03-27',
    time: { hour: 1, minute: 0, amPm: 'pm' },
    sessionMethodRequest: { type: 'PHONE', additionalDetails: 'Lorem ipsum dolor sit amet.' },
    sessionCommunication: ['Phone call'],
  }

  const mockAdditionalDetails: AdditionalInformation = {
    firstName: 'John',
  }

  const mockReferralInformationInCommunity = referralInformationInCommunity
  const mockReferralInformationInPrison = referralInformationInPrison

  beforeEach(() => {
    referralService = {
      getReferralInformation: jest.fn(),
    } as unknown as jest.Mocked<ReferralService>
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
    appointmentController = new AppointmentController(referralService, appointmentService, referenceDataService)

    ConfirmIcsPresenter.prototype.renderPage = jest.fn()

    req = {
      params: { referralId },
      session: { createAppointmentRequest: null },
      flash: jest.fn(),
    } as unknown as Request

    res = {
      locals: { user: { username: 'user1' }, content: ConfirmIcsContentFactory.build() },
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
      session: { createAppointmentRequest: null },
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
      session: { createAppointmentRequest: null },
      flash: jest.fn(),
    } as unknown as Request

    scheduleIcsRes = {
      locals: { user: { username: 'user1' }, content: ScheduleIcsContentFactory.build() },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response
  })

  describe('checkIcs', () => {
    it('should redirect to schedule-ics page when createAppointmentRequest is not in session', async () => {
      referralService.getReferralInformation.mockResolvedValue(mockReferralInformationInCommunity)
      await appointmentController.checkIcs(req, res)
      expect(res.redirect).toHaveBeenCalledWith(`/referral/${referralId}/appointment/schedule-ics`)
    })

    it('should create presenter with createAppointmentRequest from session and render page', async () => {
      referralService.getReferralInformation.mockResolvedValue(mockReferralInformationInCommunity)
      req.session.createAppointmentRequest = mockCreateAppointmentRequest

      await appointmentController.checkIcs(req, res)

      expect(ConfirmIcsPresenter).toHaveBeenCalledWith(mockCreateAppointmentRequest, referralId, mockAdditionalDetails)
      expect(ConfirmIcsPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })
  })

  describe('scheduleIcs', () => {
    it('should render schedule-ics page - community ', async () => {
      referralService.getReferralInformation.mockResolvedValue(mockReferralInformationInCommunity)
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
      referralService.getReferralInformation.mockResolvedValue(mockReferralInformationInPrison)
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
      referralService.getReferralInformation.mockResolvedValue(mockReferralInformationInCommunity)
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
