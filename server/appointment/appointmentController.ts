import { Request, Response } from 'express'
import ConfirmIcsPresenter from './confirm-ics/confirmIcsPresenter'
import InitialContactSessionDetailsPresenter from '../referral/InitialContactSessionDetailsPresenter'
import AppointmentService from '../services/AppointmentService'

class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  async checkIcs(req: Request, res: Response): Promise<void> {
    const { referralId } = req.params as { referralId: string }
    const createAppointmentRequest = req.session?.createAppointmentRequest
    if (!createAppointmentRequest) {
      return res.redirect(`/referral/${referralId}/appointment/schedule-ics`)
    }

    const presenter = new ConfirmIcsPresenter(createAppointmentRequest, referralId)
    return presenter.renderPage(res)
  }

  changeIcs(req: Request, res: Response): Promise<void> {
    const { referralId, icsId } = req.params
    const { username } = res.locals.user
    return this.appointmentService
      .getICS(referralId.toString(), icsId.toString(), username)
      .then(data => new InitialContactSessionDetailsPresenter(data))
      .then(presenter => presenter.renderPage(res))
  }
}

export default AppointmentController
