import { Request, Response, NextFunction } from 'express'
import { CreateAppointmentRequest } from '@community-support-api'
import AppointmentController from './appointmentController'
import ConfirmIcsPresenter from './confirm-ics/confirmIcsPresenter'
import ConfirmIcsContentFactory from '../testutils/factories/ConfirmIcsContent'

jest.mock('./confirm-ics/confirmIcsPresenter')

describe('AppointmentController', () => {
  let appointmentController: AppointmentController
  let req: Request
  let res: Response
  let next: NextFunction

  const referralId = 'referral-123'

  const mockCreateAppointmentRequest: CreateAppointmentRequest = {
    date: '2026-03-27',
    time: { hour: 1, minute: 0, amPm: 'pm' },
    sessionMethodRequest: { type: 'PHONE', additionalDetails: 'Lorem ipsum dolor sit amet.' },
    sessionCommunication: ['Phone call'],
  }

  beforeEach(() => {
    appointmentController = new AppointmentController()

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

    next = jest.fn()
  })

  describe('checkIcs', () => {
    it('should redirect to schedule-ics page when createAppointmentRequest is not in session', async () => {
      await appointmentController.checkIcs(req, res, next)
      expect(res.redirect).toHaveBeenCalledWith(`/referral/${referralId}/appointment/schedule-ics`)
    })

    it('should create presenter with createAppointmentRequest from session and render page', async () => {
      req.session.createAppointmentRequest = mockCreateAppointmentRequest

      await appointmentController.checkIcs(req, res, next)

      expect(ConfirmIcsPresenter).toHaveBeenCalledWith(mockCreateAppointmentRequest, referralId)
      expect(ConfirmIcsPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })
  })
})
