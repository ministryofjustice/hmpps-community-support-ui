import { NextFunction, Request, Response } from 'express'
import ConfirmIcsPresenter from './confirm-ics/confirmIcsPresenter'

class AppointmentController {
  async checkIcs(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { referralId } = req.params as { referralId: string }
    const createAppointmentRequest = req.session?.createAppointmentRequest
    if (!createAppointmentRequest) {
      return res.redirect(`/referral/${referralId}/appointment/schedule-ics`)
    }

    const presenter = new ConfirmIcsPresenter(createAppointmentRequest, referralId)
    return presenter.renderPage(res)
  }
}

export default AppointmentController
