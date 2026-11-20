import type { Request, Response } from 'express'
import ReferralService from '../../services/referralService'
import NotesListPresenter from './notesListPresenter'
import NotesTypePresenter from './notesTypePresenter'
import { NoteData } from '../../@types/express'
import { validateRequestBodyAgainstSchema } from '../../validation/validationUtils'
import { NotesTypeSchema } from '../../validation/NotesTypeFormData'

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
  
  async showNotesType(req: Request, res: Response) {
    const { caseReference } = req.params as { caseReference: string }
    const validationErrors = res.locals.errors
    const noteSessionData: NoteData = req.session?.note

    const presenter = new NotesTypePresenter(caseReference, noteSessionData, validationErrors)
    return presenter.renderPage(res)
  }

  async submitNotesType(req: Request, res: Response) {
    const { caseReference } = req.params as { caseReference: string }

    const { noteType } = req.body
    return validateRequestBodyAgainstSchema(NotesTypeSchema, req, res, async () => {
      req.session.note = { noteType } satisfies NoteData
      return res.redirect(`/referral/${caseReference}/notes/pathways`)
    })
  }
}
