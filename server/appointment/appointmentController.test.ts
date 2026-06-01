import { Request, Response } from 'express'
import { AppointmentIcsResponse, CreateAppointmentRequest } from '@community-support-api'
import { randomUUID } from 'crypto'
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
import IcsFeedbackCheckContentFactory from '../testutils/factories/IcsFeedbackCheckContent'
import ReferenceDataService from '../services/referenceDataService'
import { prisonsData, probationOfficesData } from '../../integration_tests/mockData/referenceData'
import {
  referralInformationInCommunity,
  referralInformationInPrison,
} from '../../integration_tests/mockData/referralInformationData'
import ViewChangeSessionDetailsPresenter from './view-change-session-details/ViewChangeSessionDetailsPresenter'
import IcsFeedbackCheckYourAnswersPresenter from './check-ics-feedback/icsFeedbackCheckYourAnswersPresenter'
import { ReferralProgressBannerContent } from '../referral/progress/ReferralProgressBannerContent'

jest.mock('./confirm-ics/confirmIcsPresenter')
jest.mock('../services/AppointmentService')
jest.mock('./schedule-ics/scheduleIcsPresenter')
jest.mock('./ics-feedback/icsFeedbackHowSessionTookPlacePresenter')
jest.mock('../services/referralService')
jest.mock('../services/referenceDataService')
jest.mock('./view-change-session-details/ViewChangeSessionDetailsPresenter')
jest.mock('./check-ics-feedback/icsFeedbackCheckYourAnswersPresenter')

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
    submitHref: `/referral/${referralId}/appointment/submit-ics`,
    scheduleIcsHref: `/referral/${referralId}/appointment/schedule-ics`,
  }

  const mockIcsId = randomUUID()

  const mockAppointmentIcsResponse: AppointmentIcsResponse = {
    appointmentIcsId: mockIcsId,
    appointmentId: randomUUID(),
    referralId,
    appointmentType: 'ICS',
    appointmentDate: '2026-03-27',
    appointmentTime: { hour: 1, minute: 0, amPm: 'pm' },
    appointmentStatus: 'SCHEDULED',
    sessionMethod: {
      appointmentCategory: 'VIRTUAL',
      type: 'PHONE',
      whyNotInPersonReason: 'Lorem ipsum dolor sit amet.',
    },
    sessionCommunications: ['Phone'],
    referralFirstName: 'John',
    referralLastName: 'Doe',
    createdAt: '2026-03-01T10:00:00Z',
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
    ViewChangeSessionDetailsPresenter.prototype.renderPage = jest.fn()

    req = {
      params: { referralId },
      session: { createAppointmentRequest: null, icsFeedbackSubmission: null },
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

      expect(ConfirmIcsPresenter).toHaveBeenCalledWith(mockCreateAppointmentRequest, mockAdditionalDetails)
      expect(ConfirmIcsPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })
  })

  describe('scheduleIcs', () => {
    it('should render schedule-ics page - community ', async () => {
      referralService.getReferralInformation.mockResolvedValue(mockReferralInformationInCommunity)
      await appointmentController.showScheduleIcs(scheduleIcsCommunityReq, scheduleIcsRes)
      referenceDataService.getProbationOffices.mockResolvedValue(probationOfficesData)
      referenceDataService.getPrisons.mockResolvedValue(prisonsData)

      await appointmentController.showScheduleIcs(scheduleIcsCommunityReq, scheduleIcsRes)

      expect(ScheduleIcsPresenter).toHaveBeenCalledWith(
        referralId,
        probationOfficesData,
        prisonsData,
        mockReferralInformationInCommunity,
        expect.any(Object),
        expect.any(Object),
      )
      expect(ScheduleIcsPresenter.prototype.renderPage).toHaveBeenCalledWith(scheduleIcsRes)
    })

    it('should render schedule-ics page - custody ', async () => {
      referralService.getReferralInformation.mockResolvedValue(mockReferralInformationInPrison)
      await appointmentController.showScheduleIcs(scheduleIcsPrisonReq, scheduleIcsRes)

      expect(ScheduleIcsPresenter).toHaveBeenCalledWith(
        referralId,
        probationOfficesData,
        prisonsData,
        mockReferralInformationInPrison,
        expect.any(Object),
        expect.any(Object),
      )
      expect(ScheduleIcsPresenter.prototype.renderPage).toHaveBeenCalledWith(scheduleIcsRes)
    })

    it('should create presenter with createAppointmentRequest from session and render page', async () => {
      referralService.getReferralInformation.mockResolvedValue(mockReferralInformationInCommunity)
      req.session.createAppointmentRequest = mockCreateAppointmentRequest

      await appointmentController.showScheduleIcs(scheduleIcsCommunityReq, scheduleIcsRes)

      expect(ScheduleIcsPresenter).toHaveBeenCalledWith(
        referralId,
        probationOfficesData,
        prisonsData,
        mockReferralInformationInCommunity,
        expect.any(Object),
        expect.any(Object),
      )
      expect(ScheduleIcsPresenter.prototype.renderPage).toHaveBeenCalledWith(scheduleIcsRes)
    })
  })

  describe('recordAttendance', () => {
    beforeEach(() => {
      res.locals.content = {
        pageHeader: 'Record session attendance',
        description:
          'The date and time of the session are a permanent record of where this person was. If the session started late, you must record this as part of the feedback.',
        appointmentDetails: {
          dateLabel: 'Date',
          startTimeLabel: 'Start time',
        },
        backLink: '/progress/id',
        attendanceForm: {
          radios: {
            id: 'happened',
            heading: 'Did the session happen?',
            hint: 'The session happened if something was delivered. ',
            error: 'Select yes if the session happened',
            options: [
              {
                label: 'Yes',
              },
              {
                label: 'No',
                radios: {
                  id: 'attended',
                  heading: 'Did firstname come to the appointment?',
                  error: 'Select yes if firstname came to the appointment',
                  options: [
                    {
                      label: 'Yes',
                    },
                    {
                      label: 'No',
                    },
                  ],
                },
              },
            ],
          },
          happenedRadios: {
            id: 'happened',
            heading: 'Did the session happen?',
            hint: 'The session happened if something was delivered. ',
            error: 'Select yes if the session happened',
            yesLabel: 'Yes',
            noLabel: 'No',
          },
          attendedRadios: {
            id: 'attended',
            heading: 'Did {{ firstname }} come to the appointment?',
            error: 'Select yes if {{ firstname }} came to the appointment',
            yesLabel: 'Yes',
            noLabel: 'No',
          },
          submitButtonText: 'Continue',
        },
      }
    })
    test('nothing selected', async () => {
      const caseRefId = randomUUID()
      req = {
        ...req,
        params: { caseRefId },
        body: {},
        url: `/ics-feedback/${caseRefId}/attendance`,
      } as unknown as Request
      await appointmentController.recordIcsAppointmentAttendance(req, res)

      const { formKeys } = req.session
      expect(formKeys).toHaveLength(1)
      expect(formKeys).toContain('happened')

      expect(req.flash).toHaveBeenCalledWith('happenedError', 'Select yes if the session happened')
      expect(req.flash).not.toHaveBeenCalledWith('attendedError')
      expect(res.redirect).toHaveBeenCalledWith(`/ics-feedback/${caseRefId}/attendance`)
    })
    test('happened selected, but attended unselected', async () => {
      const caseRefId = randomUUID()
      req = {
        ...req,
        params: { caseRefId },
        body: { happened: 'No' },
        url: `/ics-feedback/${caseRefId}/attendance`,
      } as unknown as Request
      await appointmentController.recordIcsAppointmentAttendance(req, res)

      const { formKeys } = req.session
      expect(formKeys).toHaveLength(1)
      expect(formKeys).toContain('attended')

      expect(req.flash).not.toHaveBeenCalledWith('happenedError')
      expect(req.flash).toHaveBeenCalledWith('attendedError', 'Select yes if {{ firstname }} came to the appointment')
      expect(res.redirect).toHaveBeenCalledWith(`/ics-feedback/${caseRefId}/attendance`)
    })
    test('bad body data', async () => {
      const caseRefId = randomUUID()
      req = {
        ...req,
        params: { caseRefId },
        body: { message: 'hello' },
        url: `/ics-feedback/${caseRefId}/attendance`,
      } as unknown as Request
      await appointmentController.recordIcsAppointmentAttendance(req, res)

      const { formKeys } = req.session
      expect(formKeys).toHaveLength(1)
      expect(formKeys).toContain('happened')

      expect(req.flash).toHaveBeenCalledWith('happenedError', 'Select yes if the session happened')
      expect(req.flash).not.toHaveBeenCalledWith('attendedError')
      expect(res.redirect).toHaveBeenCalledWith(`/ics-feedback/${caseRefId}/attendance`)
    })
    test('session happened', async () => {
      const caseRefId = randomUUID()
      req = {
        ...req,
        params: { caseRefId },
        body: { happened: 'Yes' },
        url: `/ics-feedback/${caseRefId}/attendance`,
      } as unknown as Request
      await appointmentController.recordIcsAppointmentAttendance(req, res)
      expect(req.session.icsFeedbackSubmission).toStrictEqual({
        caseReferenceId: caseRefId,
        record: { didPersonAttend: true, didSessionHappen: true },
      })
      expect(req.flash).not.toHaveBeenCalledWith('happenedError')
      expect(req.flash).not.toHaveBeenCalledWith('attendedError')
      expect(res.redirect).toHaveBeenCalledWith(`/ics-feedback/${caseRefId}/did-session-take-place`)
    })
    test('session did not happen but was attended', async () => {
      const caseRefId = randomUUID()
      req = {
        ...req,
        params: { caseRefId },
        body: { happened: 'No', attended: 'Yes' },
        url: `/ics-feedback/${caseRefId}/attendance`,
      } as unknown as Request
      await appointmentController.recordIcsAppointmentAttendance(req, res)
      expect(req.session.icsFeedbackSubmission).toStrictEqual({
        caseReferenceId: caseRefId,
        record: { didPersonAttend: true, didSessionHappen: false },
      })
      expect(req.flash).not.toHaveBeenCalledWith('happenedError')
      expect(req.flash).not.toHaveBeenCalledWith('attendedError')
      expect(res.redirect).toHaveBeenCalledWith(`/ics-feedback/${caseRefId}/why-did-the-session-not-happen`)
    })
    test('session did not happen and was not attended', async () => {
      const caseRefId = randomUUID()
      req = {
        ...req,
        params: { caseRefId },
        body: { happened: 'No', attended: 'No' },
        url: `/ics-feedback/${caseRefId}/attendance`,
      } as unknown as Request
      await appointmentController.recordIcsAppointmentAttendance(req, res)
      expect(req.session.icsFeedbackSubmission).toStrictEqual({
        caseReferenceId: caseRefId,
        record: { didPersonAttend: false, didSessionHappen: false },
      })
      expect(req.flash).not.toHaveBeenCalledWith('happenedError')
      expect(req.flash).not.toHaveBeenCalledWith('attendedError')
      expect(res.redirect).toHaveBeenCalledWith(`/ics-feedback/${caseRefId}/how-they-tried-to-contact-the-person`)
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
      await appointmentController.didSessionTakePlace(icsFeedbackReq, icsFeedbackRes)

      expect(IcsFeedbackHowSessionTookPlacePresenter).toHaveBeenCalledWith(
        'ics-123',
        mockIcsAppointment.sessionMethod,
        probationOfficesData,
        {},
        undefined,
      )
      expect(IcsFeedbackHowSessionTookPlacePresenter.prototype.renderPage).toHaveBeenCalledWith(icsFeedbackRes)
    })

    it('renders the ics-feedback page on GET with form data loaded from session (PHONE)', async () => {
      icsFeedbackReq.session.icsFeedbackSubmission = {
        record: { didSessionHappen: true, howSessionTookPlace: { type: 'PHONE' } },
        caseReferenceId: 'ics-123',
      }

      await appointmentController.didSessionTakePlace(icsFeedbackReq, icsFeedbackRes)

      expect(IcsFeedbackHowSessionTookPlacePresenter).toHaveBeenCalledWith(
        'ics-123',
        mockIcsAppointment.sessionMethod,
        probationOfficesData,
        { phoneCall: 'yes' },
        undefined,
      )
      expect(IcsFeedbackHowSessionTookPlacePresenter.prototype.renderPage).toHaveBeenCalledWith(icsFeedbackRes)
    })

    it('renders the ics-feedback page on GET with form data loaded from session (PHONE with reason)', async () => {
      icsFeedbackReq.session.icsFeedbackSubmission = {
        record: {
          didSessionHappen: true,
          howSessionTookPlace: { type: 'PHONE', additionalDetails: 'Video not available' },
        },
        caseReferenceId: 'ics-123',
      }

      await appointmentController.didSessionTakePlace(icsFeedbackReq, icsFeedbackRes)

      expect(IcsFeedbackHowSessionTookPlacePresenter).toHaveBeenCalledWith(
        'ics-123',
        mockIcsAppointment.sessionMethod,
        probationOfficesData,
        {
          phoneCall: 'no',
          howSessionTookPlace: 'PHONE',
          phoneCallReason: 'Video not available',
        },
        undefined,
      )
      expect(IcsFeedbackHowSessionTookPlacePresenter.prototype.renderPage).toHaveBeenCalledWith(icsFeedbackRes)
    })

    it('renders the ics-feedback page on GET with form data loaded from session (VIDEO)', async () => {
      icsFeedbackReq.session.icsFeedbackSubmission = {
        record: { didSessionHappen: true, howSessionTookPlace: { type: 'VIDEO', additionalDetails: 'Remote only' } },
        caseReferenceId: 'ics-123',
      }

      await appointmentController.didSessionTakePlace(icsFeedbackReq, icsFeedbackRes)

      expect(IcsFeedbackHowSessionTookPlacePresenter).toHaveBeenCalledWith(
        'ics-123',
        mockIcsAppointment.sessionMethod,
        probationOfficesData,
        {
          phoneCall: 'no',
          howSessionTookPlace: 'VIDEO',
          videoCallReason: 'Remote only',
        },
        undefined,
      )
    })

    it('renders the ics-feedback page on GET with form data loaded from session (IN_PERSON_PROBATION_OFFICE)', async () => {
      icsFeedbackReq.session.icsFeedbackSubmission = {
        record: {
          didSessionHappen: true,
          howSessionTookPlace: { type: 'IN_PERSON_PROBATION_OFFICE', pdu: 'PDU-South-East' },
        },
        caseReferenceId: 'ics-123',
      }

      await appointmentController.didSessionTakePlace(icsFeedbackReq, icsFeedbackRes)

      expect(IcsFeedbackHowSessionTookPlacePresenter).toHaveBeenCalledWith(
        'ics-123',
        mockIcsAppointment.sessionMethod,
        probationOfficesData,
        {
          phoneCall: 'no',
          howSessionTookPlace: 'IN_PERSON_PROBATION_OFFICE',
          probationDeliveryUnit: 'PDU-South-East',
        },
        undefined,
      )
    })

    it('renders the ics-feedback page on GET with form data loaded from session (IN_PERSON_OTHER_LOCATION)', async () => {
      icsFeedbackReq.session.icsFeedbackSubmission = {
        record: {
          didSessionHappen: true,
          howSessionTookPlace: {
            type: 'IN_PERSON_OTHER_LOCATION',
            addressLine1: '123 Main St',
            townOrCity: 'London',
            postcode: 'SW1A 1AA',
          },
        },
        caseReferenceId: 'ics-123',
      }

      await appointmentController.didSessionTakePlace(icsFeedbackReq, icsFeedbackRes)

      expect(IcsFeedbackHowSessionTookPlacePresenter).toHaveBeenCalledWith(
        'ics-123',
        mockIcsAppointment.sessionMethod,
        probationOfficesData,
        expect.objectContaining({ phoneCall: 'no', howSessionTookPlace: 'IN_PERSON_OTHER_LOCATION' }),
        undefined,
      )
    })

    it('saves submitted form data to session, flashes errors and redirects on invalid POST', async () => {
      icsFeedbackReq.method = 'POST'
      icsFeedbackReq.url = '/ics-feedback/ics-123/did-session-take-place'
      icsFeedbackReq.body = { phoneCall: 'no' } // missing howSessionTookPlace

      await appointmentController.recordDidSessionTakePlace(icsFeedbackReq, icsFeedbackRes)

      expect(icsFeedbackReq.flash).toHaveBeenCalled()
      expect(icsFeedbackRes.redirect).toHaveBeenCalledWith('/ics-feedback/ics-123/did-session-take-place')
      expect(icsFeedbackReq.session.pending).toEqual(expect.objectContaining({ phoneCall: 'no' }))
    })

    it('saves submitted form data with nested field to session and redirects on invalid POST', async () => {
      icsFeedbackReq.method = 'POST'
      icsFeedbackReq.url = '/ics-feedback/ics-123/did-session-take-place'
      icsFeedbackReq.body = { didSessionTakePlaceAsPlanned: 'no', howSessionTookPlace: 'PHONE', phoneCallReason: '' }

      await appointmentController.recordDidSessionTakePlace(icsFeedbackReq, icsFeedbackRes)

      expect(icsFeedbackReq.flash).toHaveBeenCalledWith('phoneCallReasonError', expect.any(String))
      expect(icsFeedbackRes.redirect).toHaveBeenCalledWith('/ics-feedback/ics-123/did-session-take-place')
      expect(icsFeedbackReq.session.pending).toEqual(expect.objectContaining({ didSessionTakePlaceAsPlanned: 'no' }))
    })

    it('restores form data from session on GET after failed POST', async () => {
      icsFeedbackReq.session.pending = {
        didSessionTakePlaceAsPlanned: 'no',
        howSessionTookPlace: 'PHONE',
        phoneCallReason: '',
      }

      await appointmentController.didSessionTakePlace(icsFeedbackReq, icsFeedbackRes)

      expect(IcsFeedbackHowSessionTookPlacePresenter).toHaveBeenCalledWith(
        'ics-123',
        mockIcsAppointment.sessionMethod,
        probationOfficesData,
        { didSessionTakePlaceAsPlanned: 'no', howSessionTookPlace: 'PHONE', phoneCallReason: '' },
        undefined,
      )
      expect(icsFeedbackReq.session.pending).toBeUndefined()
    })

    it('saves howSessionTookPlace to session and redirects on valid POST with phoneCall yes (no prior session)', async () => {
      icsFeedbackReq.method = 'POST'
      icsFeedbackReq.body = { didSessionTakePlaceAsPlanned: 'yes' }
      icsFeedbackReq.session.icsFeedbackSubmission = {
        record: {
          didSessionHappen: true,
          howSessionTookPlace: null,
        },
        caseReferenceId: 'ics-123',
      }

      await appointmentController.recordDidSessionTakePlace(icsFeedbackReq, icsFeedbackRes)

      expect(icsFeedbackReq.session.icsFeedbackSubmission.record.howSessionTookPlace).toEqual({
        type: 'PHONE' as const,
      })
      expect(icsFeedbackRes.redirect).toHaveBeenCalledWith(`/ics-feedback/ics-123/session-details`)
    })

    it('saves howSessionTookPlace to session and redirects on valid POST with phoneCall yes', async () => {
      icsFeedbackReq.method = 'POST'
      icsFeedbackReq.body = {
        didSessionTakePlaceAsPlanned: 'yes',
        phoneCall: 'yes',
      }
      icsFeedbackReq.session.icsFeedbackSubmission = { record: { didSessionHappen: true }, caseReferenceId: 'ics-123' }

      await appointmentController.recordDidSessionTakePlace(icsFeedbackReq, icsFeedbackRes)

      expect(icsFeedbackReq.session.icsFeedbackSubmission.record.howSessionTookPlace).toEqual({
        type: 'PHONE',
      })
      expect(icsFeedbackRes.redirect).toHaveBeenCalledWith(`/ics-feedback/ics-123/session-details`)
    })

    it('saves howSessionTookPlace to session and redirects on valid POST with PHONE (howSessionTookPlace)', async () => {
      icsFeedbackReq.method = 'POST'
      icsFeedbackReq.body = {
        didSessionTakePlaceAsPlanned: 'no',
        howSessionTookPlace: 'PHONE',
        phoneCallReason: 'Video not available',
      }
      icsFeedbackReq.session.icsFeedbackSubmission = { record: { didSessionHappen: true }, caseReferenceId: 'ics-123' }

      await appointmentController.recordDidSessionTakePlace(icsFeedbackReq, icsFeedbackRes)

      expect(icsFeedbackReq.session.icsFeedbackSubmission.record.howSessionTookPlace).toEqual({
        type: 'PHONE',
        additionalDetails: 'Video not available',
      })
      expect(icsFeedbackRes.redirect).toHaveBeenCalledWith(`/ics-feedback/ics-123/session-details`)
    })

    it('saves howSessionTookPlace to session and redirects on valid POST with VIDEO', async () => {
      icsFeedbackReq.method = 'POST'
      icsFeedbackReq.body = {
        didSessionTakePlaceAsPlanned: 'no',
        howSessionTookPlace: 'VIDEO',
        videoCallReason: 'Teams only',
      }
      icsFeedbackReq.session.icsFeedbackSubmission = { record: { didSessionHappen: true }, caseReferenceId: 'ics-123' }

      await appointmentController.recordDidSessionTakePlace(icsFeedbackReq, icsFeedbackRes)

      expect(icsFeedbackReq.session.icsFeedbackSubmission.record.howSessionTookPlace).toEqual({
        type: 'VIDEO',
        additionalDetails: 'Teams only',
      })
      expect(icsFeedbackRes.redirect).toHaveBeenCalledWith(`/ics-feedback/ics-123/session-details`)
    })

    it('saves howSessionTookPlace to session and redirects on valid POST with IN_PERSON_PROBATION_OFFICE', async () => {
      icsFeedbackReq.method = 'POST'
      icsFeedbackReq.body = {
        didSessionTakePlaceAsPlanned: 'no',
        howSessionTookPlace: 'IN_PERSON_PROBATION_OFFICE',
        probationDeliveryUnit: 'PDU-123',
      }
      icsFeedbackReq.session.icsFeedbackSubmission = { record: { didSessionHappen: true }, caseReferenceId: 'ics-123' }

      await appointmentController.recordDidSessionTakePlace(icsFeedbackReq, icsFeedbackRes)

      expect(icsFeedbackReq.session.icsFeedbackSubmission.record.howSessionTookPlace).toEqual({
        type: 'IN_PERSON_PROBATION_OFFICE',
        pdu: 'PDU-123',
      })
    })

    it('saves howSessionTookPlace to session and redirects on valid POST with IN_PERSON_OTHER_LOCATION', async () => {
      icsFeedbackReq.method = 'POST'
      icsFeedbackReq.body = {
        didSessionTakePlaceAsPlanned: 'no',
        howSessionTookPlace: 'IN_PERSON_OTHER_LOCATION',
        addressLine1: '56 Carlisle Road',
        addressLine2: '',
        townOrCity: 'London',
        county: '',
        postcode: 'N1 6XE',
      }
      icsFeedbackReq.session.icsFeedbackSubmission = { record: { didSessionHappen: true }, caseReferenceId: 'ics-123' }

      await appointmentController.recordDidSessionTakePlace(icsFeedbackReq, icsFeedbackRes)

      expect(icsFeedbackReq.session.icsFeedbackSubmission.record.howSessionTookPlace).toEqual({
        type: 'IN_PERSON_OTHER_LOCATION',
        addressLine1: '56 Carlisle Road',
        addressLine2: '',
        townOrCity: 'London',
        county: '',
        postcode: 'N1 6XE',
      })
    })
  })

  describe('viewChangeSessionDetails', () => {
    let viewChangeReq: Request
    let viewChangeRes: Response

    beforeEach(() => {
      viewChangeReq = {
        params: { referralId, icsId: mockIcsId },
        session: {},
        flash: jest.fn(),
      } as unknown as Request

      viewChangeRes = {
        locals: { user: { username: 'user1' }, content: {} },
        render: jest.fn(),
        redirect: jest.fn(),
      } as unknown as Response
    })

    it('should call getIcsById and render the view-change session details page', async () => {
      jest.spyOn(appointmentService, 'getIcsById').mockResolvedValue(mockAppointmentIcsResponse)

      await appointmentController.viewChangeSessionDetails(viewChangeReq, viewChangeRes)

      expect(appointmentService.getIcsById).toHaveBeenCalledWith(referralId, mockIcsId, 'user1')
      expect(ViewChangeSessionDetailsPresenter).toHaveBeenCalledWith(mockAppointmentIcsResponse, referralId, mockIcsId)
      expect(ViewChangeSessionDetailsPresenter.prototype.renderPage).toHaveBeenCalledWith(viewChangeRes)
    })
  })
  describe('How they tried to contact the person', () => {
    let caseReferenceId = ''
    const username = 'username'
    beforeEach(() => {
      caseReferenceId = randomUUID()
      req = {
        ...req,
        url: `/ics-feedback/${caseReferenceId}/how-they-tried-to-contact-the-person`,
        session: {
          icsFeedbackSubmission: {
            caseReferenceId,
            record: {
              didSessionHappen: false,
              didPersonAttend: false,
            },
          },
        },
        params: { caseRefId: caseReferenceId },
        locals: {
          user: username,
          content: {
            pageHeader:
              'How did you try to contact {{ firstname }} and what do you know about why they did not attend?',
            feedbackForm: {
              textarea: {
                id: 'howTheyTriedToContactThePerson',
                name: 'howTheyTriedToContactThePerson',
                label: 'How did you try to contact {{ firstname }} and what do you know about why they did not attend?',
                hint: 'Include when you tried to contact them and how many times.',
                error:
                  'Enter how you tried to contact {{ first name }} and what you know about why they did not attend ',
                rows: '5',
              },
              submitButtonText: 'Continue',
            },
            backLink: '/ics-feedback/{{ id }}/attendance',
          },
        },
      } as unknown as Request
      jest.spyOn(appointmentService, 'getICS').mockResolvedValue(mockAppointmentIcsResponse)
    })
    test('empty form data', async () => {
      req.body = {}
      await appointmentController.recordHowTheyTriedToContactThePerson(req, res)
      expect(res.redirect).toHaveBeenCalledWith(`/ics-feedback/${caseReferenceId}/how-they-tried-to-contact-the-person`)
      expect(req.flash).toHaveBeenCalledWith(
        'howTheyTriedToContactThePersonError',
        'Enter how you tried to contact John and what you know about why they did not attend',
      )
    })
    test('empty text', async () => {
      req.body = { howTheyTriedToContactThePerson: '' }
      await appointmentController.recordHowTheyTriedToContactThePerson(req, res)
      expect(res.redirect).toHaveBeenCalledWith(`/ics-feedback/${caseReferenceId}/how-they-tried-to-contact-the-person`)
      expect(req.flash).toHaveBeenCalledWith(
        'howTheyTriedToContactThePersonError',
        'Enter how you tried to contact John and what you know about why they did not attend',
      )
    })
    test('too much text', async () => {
      req.body = { howTheyTriedToContactThePerson: new Array(401).fill('a').join('') }
      await appointmentController.recordHowTheyTriedToContactThePerson(req, res)
      expect(res.redirect).toHaveBeenCalledWith(`/ics-feedback/${caseReferenceId}/how-they-tried-to-contact-the-person`)
      expect(req.flash).toHaveBeenCalledWith(
        'howTheyTriedToContactThePersonError',
        'How you tried to contact John and what you know about why they did not attend must be 400 characters or less',
      )
    })
    test('happy path', async () => {
      req.body = { howTheyTriedToContactThePerson: new Array(400).fill('a').join('') }
      await appointmentController.recordHowTheyTriedToContactThePerson(req, res)
      expect(req.flash).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith(`/ics-feedback/${caseReferenceId}/check-answers`)
    })
    test('redirect when case reference id is different from the session', async () => {
      const caseRefId = randomUUID()
      req.params.caseRefId = caseRefId
      await appointmentController.howTheyTriedToContactThePerson(req, res)
      expect(req.session.icsFeedbackSubmission).toBeUndefined()
      expect(res.redirect).toHaveBeenCalledWith(`/ics-feedback/${caseRefId}/attendance`)
      expect(req.flash).not.toHaveBeenCalled()
    })
    test('redirect when session data is missing', async () => {
      delete req.session.icsFeedbackSubmission
      await appointmentController.howTheyTriedToContactThePerson(req, res)
      expect(res.redirect).toHaveBeenCalledWith(`/ics-feedback/${caseReferenceId}/attendance`)
      expect(req.flash).not.toHaveBeenCalled()
    })
  })

  describe('checkIcsFeedback', () => {
    let icsFeedbackCheckReq: Request
    let icsFeedbackCheckRes: Response

    beforeEach(() => {
      IcsFeedbackCheckYourAnswersPresenter.prototype.renderPage = jest.fn()

      icsFeedbackCheckReq = {
        params: { caseRefId: 'AB1234CD' },
        session: { icsFeedbackSubmission: null },
        method: 'GET',
        body: {},
        flash: jest.fn(),
      } as unknown as Request

      icsFeedbackCheckRes = {
        locals: { user: { username: 'user1' }, content: IcsFeedbackCheckContentFactory.build() },
        render: jest.fn(),
        redirect: jest.fn(),
      } as unknown as Response
    })

    it('redirects to progress page if no feedback submission in session', async () => {
      await appointmentController.checkIcsFeedback(icsFeedbackCheckReq, icsFeedbackCheckRes)

      expect(icsFeedbackCheckReq.session.icsFeedbackSubmission).toBeNull()
      expect(icsFeedbackCheckRes.redirect).toHaveBeenCalledWith('/progress/AB1234CD')
    })

    it('renders the check your answers page with presenter if feedback submission exists in session', async () => {
      jest.spyOn(appointmentService, 'getICS').mockResolvedValue(mockAppointmentIcsResponse)
      const mockSubmission = {
        record: {
          didSessionHappen: true,
          howSessionTookPlace: { type: 'PHONE' as const, additionalDetails: 'Video not available' },
        },
        caseReferenceId: 'AB1234CD',
      }

      icsFeedbackCheckReq.session.icsFeedbackSubmission = mockSubmission

      await appointmentController.checkIcsFeedback(icsFeedbackCheckReq, icsFeedbackCheckRes)

      expect(IcsFeedbackCheckYourAnswersPresenter).toHaveBeenCalledWith(
        mockSubmission,
        'AB1234CD',
        mockAppointmentIcsResponse.referralFirstName,
      )
      expect(IcsFeedbackCheckYourAnswersPresenter.prototype.renderPage).toHaveBeenCalledWith(icsFeedbackCheckRes)
    })

    it('redirects to progress page after submitting feedback', async () => {
      jest.spyOn(appointmentService, 'submitIcsFeedback').mockResolvedValue(undefined)
      jest.spyOn(appointmentService, 'getICS').mockResolvedValue(mockAppointmentIcsResponse)
      const caseRefId = 'AB1234CD'
      const username = 'user1'
      const mockSubmission = {
        record: {
          didSessionHappen: true,
          howSessionTookPlace: { type: 'PHONE' as const, additionalDetails: 'Video not available' },
        },
        caseReferenceId: caseRefId,
      }
      const bannerContent = {
        caseReference: caseRefId,
        heading: 'Session feedback submitted',
        body: 'The ICS is now complete.',
      } as ReferralProgressBannerContent

      icsFeedbackCheckReq.method = 'POST'
      icsFeedbackCheckReq.params.caseRefId = caseRefId
      icsFeedbackCheckReq.session.icsFeedbackSubmission = mockSubmission

      await appointmentController.submitFeedback(icsFeedbackCheckReq, icsFeedbackCheckRes)

      expect(appointmentService.submitIcsFeedback).toHaveBeenCalledWith(
        caseRefId,
        mockAppointmentIcsResponse.appointmentIcsId,
        mockSubmission,
        username,
      )
      expect(icsFeedbackCheckReq.session.icsFeedbackSubmission).toBeFalsy()
      expect(icsFeedbackCheckReq.session.referralProgressBanner).toEqual(bannerContent)
      expect(icsFeedbackCheckRes.redirect).toHaveBeenCalledWith(`/progress/${caseRefId}`)
    })
  })
})
