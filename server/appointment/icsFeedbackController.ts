import { Request, Response } from 'express'
import ViewSessionFeedbackPresenter from './view-session-feedback/ViewSessionFeedbackPresenter'
import AppointmentService from '../services/AppointmentService'

class IcsFeedbackController {
  constructor(private readonly appointmentService: AppointmentService) {}

  async viewFeedback(req: Request, res: Response): Promise<void> {
    const { caseRefId, rowIndex } = req.params as { caseRefId: string; rowIndex: string }
    const { username } = res.locals.user

    const index = Number(rowIndex)
    if (Number.isNaN(index)) {
      throw new Error('Invalid feedback reference')
    }

    const match = req.session.icsFeedbackInfo?.find(item => item.rowIndex === index)
    const icsFeedbackId = match?.icsFeedbackId

    if (!icsFeedbackId) {
      throw new Error('No feedback exists for this appointment')
    }

    const icsFeedbackSubmissionResponse = await this.appointmentService.getIcsSessionFeedback(icsFeedbackId, username)
    const presenter = new ViewSessionFeedbackPresenter(icsFeedbackSubmissionResponse, caseRefId)

    return presenter.renderPage(res)
  }
}

export default IcsFeedbackController
