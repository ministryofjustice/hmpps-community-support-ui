import { Request, Response } from 'express'
import ReferralService from '../../services/referralService'
import ActionPlanPresenter from './actionPlanPresenter'

class ActionPlanController {
  constructor(private readonly referralService: ReferralService) {}

  async showActionPlanPage(req: Request, res: Response) {
    const { id: caseReference } = req.params as { id: string }
    const { username } = res.locals.user

    const actionPlanSummary = await this.referralService.getActionPlanSummary(caseReference, username)
    const presenter = new ActionPlanPresenter(actionPlanSummary, caseReference)

    return presenter.renderPage(res)
  }
}

export default ActionPlanController
