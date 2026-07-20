import { IcsFeedbackSubmissionResponse } from '@community-support-api'
import { Request, Response } from 'express'
import IcsFeedbackController from './icsFeedbackController'
import AppointmentService from '../services/AppointmentService'
import ViewSessionFeedbackPresenter from './view-session-feedback/ViewSessionFeedbackPresenter'

jest.mock('../services/AppointmentService')
jest.mock('./view-session-feedback/ViewSessionFeedbackPresenter')

describe('IcsFeedbackController', () => {
  let req: Partial<Request>
  let res: Partial<Response>
  let controller: IcsFeedbackController
  let appointmentService: jest.Mocked<AppointmentService>

  const renderPage = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    appointmentService = {
      getIcsSessionFeedback: jest.fn(),
    } as unknown as jest.Mocked<AppointmentService>

    controller = new IcsFeedbackController(appointmentService)

    req = { params: {}, session: {} } as unknown as Request
    res = { locals: { user: { username: 'username' } } } as unknown as Response
    ;(ViewSessionFeedbackPresenter as jest.Mock).mockImplementation(() => ({
      renderPage,
    }))
  })

  describe('viewFeedback', () => {
    const caseRefId = 'AB1234CD'
    const icsFeedbackId = 'feedback-123'

    const mockFeedback: IcsFeedbackSubmissionResponse = {
      id: '',
      appointmentIcsId: '',
      recordSessionDidSessionHappen: true,
      recordSessionDidPersonAttend: true,
      recordSessionNotHappenReason: undefined,
      recordSessionNoAttendanceInformation: undefined,
      createdAt: '',
    }

    it('renders feedback page when a valid icsFeedbackId is provided', async () => {
      req.params = { caseRefId, icsFeedbackId }

      appointmentService.getIcsSessionFeedback.mockResolvedValue(mockFeedback)

      await controller.viewFeedback(req as Request, res as Response)

      expect(appointmentService.getIcsSessionFeedback).toHaveBeenCalledWith(icsFeedbackId, 'username')
      expect(ViewSessionFeedbackPresenter).toHaveBeenCalledWith(mockFeedback, caseRefId)
      expect(renderPage).toHaveBeenCalledWith(res)
    })

    it('throws when no icsFeedbackId is provided', async () => {
      req.params = { caseRefId, icsFeedbackId: '' }

      await expect(controller.viewFeedback(req as Request, res as Response)).rejects.toThrow(
        'No feedback exists for this appointment',
      )

      expect(appointmentService.getIcsSessionFeedback).not.toHaveBeenCalled()
    })
  })
})
