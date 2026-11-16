import type { Request, Response } from 'express'
import ReferralService from '../../services/referralService'
import ReferralNotesPresenter from './referralNotesPresenter'

export default class ReferralNotesController {
  constructor(private readonly referralService: ReferralService) {}

  async showReferralNotes(req: Request, res: Response) {
    const { caseReference } = req.params as { caseReference: string }
    const { username } = res.locals.user
    const notes = await this.referralService.getReferralNotes(caseReference, username)
    const presenter = new ReferralNotesPresenter(notes, caseReference)
    return presenter.renderPage(res)
  }
}
