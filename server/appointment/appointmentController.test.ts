import { Request, Response } from 'express'
import { AppointmentIcsResponse, CreateAppointmentRequest } from '@community-support-api'
import AppointmentController from './appointmentController'
import ConfirmIcsPresenter, { type AdditionalInformation } from './confirm-ics/confirmIcsPresenter'
import ScheduleIcsPresenter from './schedule-ics/scheduleIcsPresenter'
import IcsFeedbackHowSessionTookPlacePresenter from './ics-feedback/icsFeedbackHowSessionTookPlacePresenter'
import ConfirmIcsContentFactory from '../testutils/factories/ConfirmIcsContent'
import ReferralService from '../services/referralService'
import AppointmentService from '../services/AppointmentService'
import CommunitySupportApiClient from '../data/communitySupportApiClient'
import ScheduleIcsContentFactory from '../testutils/factories/ScheduleIcsContent'
import IcsFeedbackContentFactory from '../testutils/factories/IcsFeedbackContent'
import ReferenceDataService from '../services/referenceDataService'
import { prisonsData, probationOfficesData } from '../../integration_tests/mockData/referenceData'
import {
  referralInformationInCommunity,
  referralInformationInPrison,
} from '../../integration_tests/mockData/referralInformationData'

jest.mock('./confirm-ics/confirmIcsPresenter')
jest.mock('../services/AppointmentService')
jest.mock('./schedule-ics/scheduleIcsPresenter')
jest.mock('./ics-feedback/icsFeedbackHowSessionTookPlacePresenter')
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

  const referralId = crypto.randomUUID()

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

  describe('didSessionTookPlace', () => {
    let icsFeedbackReq: Request
    let icsFeedbackRes: Response

    const mockIcsAppointment: AppointmentIcsResponse = {
      appointmentIcsId: 'ics-123',
      appointmentId: 'appointment-456',
      referralId,
      appointmentType: 'ICS',
      appointmentDate: '2026-04-21',
      appointmentTime: { hour: 10, minute: 0, amPm: 'AM' },
      appointmentStatus: 'NEEDS_FEEDBACK',
      sessionMethod: { type: 'PHONE', appointmentCategory: 'VIRTUAL' },
      sessionCommunications: [],
      referralFirstName: 'John',
      referralLastName: 'Doe',
      createdAt: '2026-04-21T10:00:00Z',
    }

    beforeEach(() => {
      IcsFeedbackHowSessionTookPlacePresenter.prototype.renderPage = jest.fn()
      ;(appointmentService.getICS as jest.Mock).mockResolvedValue(mockIcsAppointment)

      icsFeedbackReq = {
        params: { caseRefId: 'ics-123' },
        session: {},
        method: 'GET',
        body: {},
        flash: jest.fn(),
      } as unknown as Request

      icsFeedbackRes = {
        locals: { user: { username: 'user1' }, content: IcsFeedbackContentFactory.build() },
        render: jest.fn(),
        redirect: jest.fn(),
      } as unknown as Response
    })

    it('renders the ics-feedback page on GET with empty form data when no session data', async () => {
      await appointmentController.didSessionTookPlace(icsFeedbackReq, icsFeedbackRes)

      expect(IcsFeedbackHowSessionTookPlacePresenter).toHaveBeenCalledWith(
        'ics-123',
        mockIcsAppointment.sessionMethod,
        probationOfficesData,
        {},
      )
      expect(IcsFeedbackHowSessionTookPlacePresenter.prototype.renderPage).toHaveBeenCalledWith(icsFeedbackRes)
    })

    it('renders the ics-feedback page on GET with form data loaded from session (PHONE)', async () => {
      icsFeedbackReq.session.icsFeedbackHowSessionTookPlaceSubmission = {
        'ics-123': { howSessionTookPlace: { type: 'PHONE' } },
      }

      await appointmentController.didSessionTookPlace(icsFeedbackReq, icsFeedbackRes)

      expect(IcsFeedbackHowSessionTookPlacePresenter).toHaveBeenCalledWith(
        'ics-123',
        mockIcsAppointment.sessionMethod,
        probationOfficesData,
        { phoneCall: 'yes' },
      )
      expect(IcsFeedbackHowSessionTookPlacePresenter.prototype.renderPage).toHaveBeenCalledWith(icsFeedbackRes)
    })

    it('renders the ics-feedback page on GET with form data loaded from session (PHONE with reason)', async () => {
      icsFeedbackReq.session.icsFeedbackHowSessionTookPlaceSubmission = {
        'ics-123': { howSessionTookPlace: { type: 'PHONE', additionalDetails: 'Video not available' } },
      }

      await appointmentController.didSessionTookPlace(icsFeedbackReq, icsFeedbackRes)

      expect(IcsFeedbackHowSessionTookPlacePresenter).toHaveBeenCalledWith(
        'ics-123',
        mockIcsAppointment.sessionMethod,
        probationOfficesData,
        {
          phoneCall: 'no',
          howSessionTookPlace: 'PHONE',
          phoneCallReason: 'Video not available',
        },
      )
      expect(IcsFeedbackHowSessionTookPlacePresenter.prototype.renderPage).toHaveBeenCalledWith(icsFeedbackRes)
    })

    it('renders the ics-feedback page on GET with form data loaded from session (VIDEO)', async () => {
      icsFeedbackReq.session.icsFeedbackHowSessionTookPlaceSubmission = {
        'ics-123': { howSessionTookPlace: { type: 'VIDEO', additionalDetails: 'Remote only' } },
      }

      await appointmentController.didSessionTookPlace(icsFeedbackReq, icsFeedbackRes)

      expect(IcsFeedbackHowSessionTookPlacePresenter).toHaveBeenCalledWith(
        'ics-123',
        mockIcsAppointment.sessionMethod,
        probationOfficesData,
        {
          phoneCall: 'no',
          howSessionTookPlace: 'VIDEO',
          videoCallReason: 'Remote only',
        },
      )
    })

    it('renders the ics-feedback page on GET with form data loaded from session (IN_PERSON_PROBATION_OFFICE)', async () => {
      icsFeedbackReq.session.icsFeedbackHowSessionTookPlaceSubmission = {
        'ics-123': { howSessionTookPlace: { type: 'IN_PERSON_PROBATION_OFFICE', pdu: 'PDU-South-East' } },
      }

      await appointmentController.didSessionTookPlace(icsFeedbackReq, icsFeedbackRes)

      expect(IcsFeedbackHowSessionTookPlacePresenter).toHaveBeenCalledWith(
        'ics-123',
        mockIcsAppointment.sessionMethod,
        probationOfficesData,
        {
          phoneCall: 'no',
          howSessionTookPlace: 'IN_PERSON_PROBATION_OFFICE',
          probationDeliveryUnit: 'PDU-South-East',
        },
      )
    })

    it('renders the ics-feedback page on GET with form data loaded from session (IN_PERSON_OTHER_LOCATION)', async () => {
      icsFeedbackReq.session.icsFeedbackHowSessionTookPlaceSubmission = {
        'ics-123': {
          howSessionTookPlace: {
            type: 'IN_PERSON_OTHER_LOCATION',
            addressLine1: '123 Main St',
            townOrCity: 'London',
            postcode: 'SW1A 1AA',
          },
        },
      }

      await appointmentController.didSessionTookPlace(icsFeedbackReq, icsFeedbackRes)

      expect(IcsFeedbackHowSessionTookPlacePresenter).toHaveBeenCalledWith(
        'ics-123',
        mockIcsAppointment.sessionMethod,
        probationOfficesData,
        expect.objectContaining({ phoneCall: 'no', howSessionTookPlace: 'IN_PERSON_OTHER_LOCATION' }),
      )
    })

    it('saves howSessionTookPlace to session and redirects on valid POST with phoneCall yes', async () => {
      icsFeedbackReq.method = 'POST'
      icsFeedbackReq.body = { phoneCall: 'yes' }

      await appointmentController.didSessionTookPlace(icsFeedbackReq, icsFeedbackRes)

      expect(icsFeedbackReq.session.icsFeedbackHowSessionTookPlaceSubmission).toEqual({
        'ics-123': { howSessionTookPlace: { type: 'PHONE' } },
      })
      expect(icsFeedbackRes.redirect).toHaveBeenCalledWith(`/ics-feedback/ics-123/session-details`)
    })

    it('saves howSessionTookPlace to session and redirects on valid POST with PHONE (howSessionTookPlace)', async () => {
      icsFeedbackReq.method = 'POST'
      icsFeedbackReq.body = { phoneCall: 'no', howSessionTookPlace: 'PHONE', phoneCallReason: 'Video not available' }

      await appointmentController.didSessionTookPlace(icsFeedbackReq, icsFeedbackRes)

      expect(icsFeedbackReq.session.icsFeedbackHowSessionTookPlaceSubmission).toEqual({
        'ics-123': { howSessionTookPlace: { type: 'PHONE', additionalDetails: 'Video not available' } },
      })
      expect(icsFeedbackRes.redirect).toHaveBeenCalledWith(`/ics-feedback/ics-123/session-details`)
    })

    it('saves howSessionTookPlace to session and redirects on valid POST with VIDEO', async () => {
      icsFeedbackReq.method = 'POST'
      icsFeedbackReq.body = { phoneCall: 'no', howSessionTookPlace: 'VIDEO', videoCallReason: 'Teams only' }

      await appointmentController.didSessionTookPlace(icsFeedbackReq, icsFeedbackRes)

      expect(icsFeedbackReq.session.icsFeedbackHowSessionTookPlaceSubmission).toEqual({
        'ics-123': { howSessionTookPlace: { type: 'VIDEO', additionalDetails: 'Teams only' } },
      })
      expect(icsFeedbackRes.redirect).toHaveBeenCalledWith(`/ics-feedback/ics-123/session-details`)
    })

    it('saves howSessionTookPlace to session and redirects on valid POST with IN_PERSON_PROBATION_OFFICE', async () => {
      icsFeedbackReq.method = 'POST'
      icsFeedbackReq.body = {
        phoneCall: 'no',
        howSessionTookPlace: 'IN_PERSON_PROBATION_OFFICE',
        probationDeliveryUnit: 'PDU-123',
      }

      await appointmentController.didSessionTookPlace(icsFeedbackReq, icsFeedbackRes)

      expect(icsFeedbackReq.session.icsFeedbackHowSessionTookPlaceSubmission).toEqual({
        'ics-123': { howSessionTookPlace: { type: 'IN_PERSON_PROBATION_OFFICE', pdu: 'PDU-123' } },
      })
    })

    it('saves howSessionTookPlace to session and redirects on valid POST with IN_PERSON_OTHER_LOCATION', async () => {
      icsFeedbackReq.method = 'POST'
      icsFeedbackReq.body = {
        phoneCall: 'no',
        howSessionTookPlace: 'IN_PERSON_OTHER_LOCATION',
        addressLine1: '56 Carlisle Road',
        addressLine2: '',
        townOrCity: 'London',
        county: '',
        postcode: 'N1 6XE',
      }

      await appointmentController.didSessionTookPlace(icsFeedbackReq, icsFeedbackRes)

      expect(icsFeedbackReq.session.icsFeedbackHowSessionTookPlaceSubmission).toEqual({
        'ics-123': {
          howSessionTookPlace: {
            type: 'IN_PERSON_OTHER_LOCATION',
            addressLine1: '56 Carlisle Road',
            addressLine2: '',
            townOrCity: 'London',
            county: '',
            postcode: 'N1 6XE',
          },
        },
      })
    })
  })
})
