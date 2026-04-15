import { Request, Response } from 'express'
import { CreateAppointmentRequest, ReferralDetailsResponseDto } from '@community-support-api'
import AppointmentController from './appointmentController'
import ConfirmIcsPresenter from './confirm-ics/confirmIcsPresenter'
import ScheduleIcsPresenter from './schedule-ics/scheduleIcsPresenter'
import ConfirmIcsContentFactory from '../testutils/factories/ConfirmIcsContent'
import ReferralService from '../services/referralService'
import AppointmentService from '../services/AppointmentService'
import CommunitySupportApiClient from '../data/communitySupportApiClient'
import ScheduleIcsContentFactory from '../testutils/factories/ScheduleIcsContent'
import ReferenceDataService from '../services/referenceDataService'
import { prisonsData, probationOfficesData } from '../../integration_tests/mockData/referenceData'

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

  const mockReferralDetailsInCommunity: ReferralDetailsResponseDto = {
    id: mockReferralId,
    referenceNumber: 'R20260327',
    createdDate: '2026-03-27',
    personDetailsTableData: {
      name: 'John Doe',
      crn: 'A123456',
      dateOfBirth: '1990-05-15',
      preferredLanguage: 'English',
      disabilities: '',
    },
    equalityDetailsTableData: {
      ethnicity: null,
      religionOrBelief: null,
      sex: '',
      genderIdentity: '',
      sexualOrientation: '',
      transgender: '',
    },
    contactDetailsTableData: {
      phoneNumber: null,
      mobileNumber: null,
      email: null,
      address: null,
    },
    referralDetailsTableData: {
      referralDate: '',
      assignedTo: [],
    },
  }

  const mockReferralDetailsInPrison: ReferralDetailsResponseDto = {
    id: mockReferralId,
    referenceNumber: 'R20260327',
    createdDate: '2026-03-27T10:00:00Z',
    personDetailsTableData: {
      name: 'John Doe',
      crn: 'A123456',
      dateOfBirth: '1990-05-15',
      preferredLanguage: 'English',
      disabilities: '',
    },
    equalityDetailsTableData: {
      ethnicity: null,
      religionOrBelief: null,
      sex: '',
      genderIdentity: '',
      sexualOrientation: '',
      transgender: '',
    },
    contactDetailsTableData: {
      phoneNumber: null,
      mobileNumber: null,
      email: null,
      address: null,
    },
    referralDetailsTableData: {
      referralDate: '',
      assignedTo: [],
    },
  }

  beforeEach(() => {
    referralService = {
      getCaseDetailsByCaseIdentifier: jest.fn(),
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
        mockReferralDetailsInCommunity,
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
        mockReferralDetailsInPrison,
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
      referralService.getCaseDetailsByCaseIdentifier.mockResolvedValue(mockReferralDetailsInCommunity)
      await appointmentController.scheduleIcs(scheduleIcsCommunityReq, scheduleIcsRes)
      referenceDataService.getProbationOffices.mockResolvedValue(probationOfficesData)
      referenceDataService.getPrisons.mockResolvedValue(prisonsData)

      await appointmentController.scheduleIcs(scheduleIcsCommunityReq, scheduleIcsRes)

      expect(ScheduleIcsPresenter).toHaveBeenCalledWith(
        referralId,
        probationOfficesData,
        prisonsData,
        mockReferralDetailsInCommunity,
        expect.any(Object),
      )
      expect(ScheduleIcsPresenter.prototype.renderPage).toHaveBeenCalledWith(scheduleIcsRes)
    })

    it('should render schedule-ics page - custody ', async () => {
      referralService.getCaseDetailsByCaseIdentifier.mockResolvedValue(mockReferralDetailsInPrison)
      await appointmentController.scheduleIcs(scheduleIcsPrisonReq, scheduleIcsRes)

      expect(ScheduleIcsPresenter).toHaveBeenCalledWith(
        referralId,
        probationOfficesData,
        prisonsData,
        mockReferralDetailsInPrison,
        expect.any(Object),
      )
      expect(ScheduleIcsPresenter.prototype.renderPage).toHaveBeenCalledWith(scheduleIcsRes)
    })

    it('should create presenter with createAppointmentRequest from session and render page', async () => {
      referralService.getCaseDetailsByCaseIdentifier.mockResolvedValue(mockReferralDetailsInCommunity)
      req.session.createAppointmentRequest = mockCreateAppointmentRequest

      await appointmentController.scheduleIcs(scheduleIcsCommunityReq, scheduleIcsRes)

      expect(ScheduleIcsPresenter).toHaveBeenCalledWith(
        referralId,
        probationOfficesData,
        prisonsData,
        mockReferralDetailsInCommunity,
        expect.any(Object),
      )
      expect(ScheduleIcsPresenter.prototype.renderPage).toHaveBeenCalledWith(scheduleIcsRes)
    })
  })
})
