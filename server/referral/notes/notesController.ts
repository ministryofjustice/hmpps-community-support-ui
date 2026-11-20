import type { Request, Response } from 'express'
import ReferralService from '../../services/referralService'
import NotesListPresenter from './notesListPresenter'
import NotesTypePresenter from './notesTypePresenter'
import { NoteData } from '../../@types/express'
import { validateRequestBodyAgainstSchema } from '../../validation/validationUtils'
import { NotesTypeSchema } from '../../validation/NotesTypeFormData'
import NotesPathwaysPresenter from './notesPathwaysPresenter'
import { buildNotesPathwaysSchema, NO_PATHWAY_VALUE } from '../../validation/NotesPathwaysFormData'

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

  async showPathways(req: Request, res: Response) {
    const { caseReference } = req.params as { caseReference: string }
    const { username } = res.locals.user
    const pathways = await this.referralService.getPathways(caseReference, username)
    const presenter = new NotesPathwaysPresenter(
      pathways,
      caseReference,
      req.session?.note?.noteType,
      res.locals.errors,
    )
    return presenter.renderPage(res)
  }

  async submitPathways(req: Request, res: Response) {
    const { caseReference } = req.params as { caseReference: string }
    const isCaseNote = req.session?.note?.noteType === 'CASE_NOTE'
    return validateRequestBodyAgainstSchema(buildNotesPathwaysSchema(isCaseNote), req, res, async ({ pathways }) => {
      const detailsPath = isCaseNote ? 'case-note-details' : 'non-contact-session-details'
      req.session.note = {
        ...req.session.note,
        pathways: pathways.filter(pathway => pathway !== NO_PATHWAY_VALUE),
      } as NoteData
      return res.redirect(`/referral/${caseReference}/notes/${detailsPath}`)
    })
  }
}
