import { randomUUID } from 'node:crypto'
import { IcsFeedbackSubmissionResponse } from '@community-support-api'
import { Request, Response } from 'express'
import IcsFeedbackController from './icsFeedbackController'
import AppointmentService from '../services/AppointmentService'
import ViewSessionFeedbackPresenter from './view-session-feedback/ViewSessionFeedbackPresenter'
import { SessionFeedbackDetails } from '../@types/express'

jest.mock('../services/AppointmentService')
jest.mock('./view-session-feedback/ViewSessionFeedbackPresenter')

describe('IcsFeedbackController', () => {
  let req: Partial<Request>
  let res: Partial<Response>
  let controller: IcsFeedbackController
  let appointmentService: jest.Mocked<AppointmentService>

  const setFeedbackSession = (feedbackInfo: SessionFeedbackDetails[]) => {
    ;(req.session as unknown as { icsFeedbackInfo: SessionFeedbackDetails[] }).icsFeedbackInfo = feedbackInfo
  }

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
    const appointmentId = randomUUID()

    const baseSession = [
      {
        rowIndex: 0,
        icsFeedbackId: 'feedback-123',
        appointmentId,
        appointmentDateTime: '2026-04-09T10:00:00',
      },
    ]

    const mockFeedback: IcsFeedbackSubmissionResponse = {
      id: '',
      appointmentIcsId: '',
      recordSessionDidSessionHappen: true,
      recordSessionDidPersonAttend: true,
      recordSessionNotHappenReason: undefined,
      recordSessionNoAttendanceInformation: undefined,
      createdAt: '',
    }

    it('renders feedback page when valid session feedback exists', async () => {
      req.params = { caseRefId, rowIndex: '0' }
      setFeedbackSession(baseSession)

      appointmentService.getIcsSessionFeedback.mockResolvedValue(mockFeedback)

      await controller.viewFeedback(req as Request, res as Response)

      expect(appointmentService.getIcsSessionFeedback).toHaveBeenCalledWith('feedback-123', 'username')
      expect(ViewSessionFeedbackPresenter).toHaveBeenCalledWith(mockFeedback, caseRefId)
      expect(renderPage).toHaveBeenCalledWith(res)
    })

    it('throws when rowIndex is not numeric', async () => {
      req.params = { caseRefId, rowIndex: 'abc' }

      await expect(controller.viewFeedback(req as Request, res as Response)).rejects.toThrow(
        'Invalid feedback reference',
      )

      expect(appointmentService.getIcsSessionFeedback).not.toHaveBeenCalled()
    })

    it('throws when no matching session entry exists', async () => {
      req.params = { caseRefId, rowIndex: '1' }

      setFeedbackSession(baseSession)

      await expect(controller.viewFeedback(req as Request, res as Response)).rejects.toThrow(
        'No feedback exists for this appointment',
      )

      expect(appointmentService.getIcsSessionFeedback).not.toHaveBeenCalled()
    })

    it('throws when matching entry has no icsFeedbackId', async () => {
      req.params = { caseRefId, rowIndex: '0' }

      const sessionWithNoIcsFeedbackId = [
        {
          rowIndex: 0,
          appointmentId,
          appointmentDateTime: '2026-04-09T10:00:00',
        },
      ]

      setFeedbackSession(sessionWithNoIcsFeedbackId)

      await expect(controller.viewFeedback(req as Request, res as Response)).rejects.toThrow(
        'No feedback exists for this appointment',
      )

      expect(appointmentService.getIcsSessionFeedback).not.toHaveBeenCalled()
    })
  })
})
