import { Request, Response } from 'express'
import ViewSessionFeedbackPresenter from './view-session-feedback/ViewSessionFeedbackPresenter'
import AppointmentService from '../services/AppointmentService'

class IcsFeedbackController {
  constructor(private readonly appointmentService: AppointmentService) {}

  async viewFeedback(req: Request, res: Response): Promise<void> {
    const { caseRefId, icsFeedbackId } = req.params as { caseRefId: string; icsFeedbackId: string }
    const { username } = res.locals.user

    if (!icsFeedbackId) {
      throw new Error('No feedback exists for this appointment')
    }

    const icsFeedbackSubmissionResponse = await this.appointmentService.getIcsSessionFeedback(icsFeedbackId, username)
    const presenter = new ViewSessionFeedbackPresenter(icsFeedbackSubmissionResponse, caseRefId)

    return presenter.renderPage(res)
  }
}

export default IcsFeedbackController
