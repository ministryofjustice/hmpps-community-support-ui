import type { Request, Response } from 'express'
import ReferralService from '../../services/referralService'
import NotesListPresenter from './notesListPresenter'

const NOTES_PAGE_SIZE = 25

export default class NotesController {
  constructor(private readonly referralService: ReferralService) {}

  async showReferralNotes(req: Request, res: Response) {
    const { caseReference } = req.params as { caseReference: string }
    const { username } = res.locals.user
    const page = Math.max(1, Number.parseInt(String(req.query.page ?? '1'), 10) || 1)
    const notesResponse = await this.referralService.getReferralNotes(caseReference, username, {
      page: page - 1,
      size: NOTES_PAGE_SIZE,
    })
    const presenter = new NotesListPresenter(notesResponse, caseReference)
    return presenter.renderPage(res)
  }

  async showPathways(req: Request, res: Response) {
    // const { caseReference } = req.params as { caseReference: string }
    // const { username } = res.locals.user
    res.send('Hello World!')
  }
}
