import type { Request, Response } from 'express'
import type { ReferenceDataReferralPathwaysDto, ReferralNotesBffResponseDto } from '@community-support-api'
import ReferralService from '../../services/referralService'
import NotesController from './notesController'
import NotesListPresenter from './notesListPresenter'
import NotesTypePresenter from './notesTypePresenter'
import NotesPathwaysPresenter from './notesPathwaysPresenter'
import type { ErrorMiddlewareErrors } from '../../@types/express'
import NotesCaseNoteDetailsPresenter from './notesCaseNoteDetailsPresenter'
import NotesCheckYourAnswersPresenter from './notesCheckYourAnswersPresenter'

jest.mock('../../services/referralService')
jest.mock('./notesListPresenter')
jest.mock('./notesTypePresenter')
jest.mock('./notesPathwaysPresenter')
jest.mock('./notesCaseNoteDetailsPresenter')
jest.mock('./notesCheckYourAnswersPresenter')

describe('NotesController', () => {
  const caseReference = 'AB1234CD'
  const notesResponse: ReferralNotesBffResponseDto = {
    fullName: 'John Smith',
    notesAndNonContactSessions: {
      content: [],
      page: 0,
      size: 25,
      totalElements: 0,
      totalPages: 0,
    },
  }

  let res: Response
  let req: Request
  let referralService: jest.Mocked<ReferralService>
  let controller: NotesController

  const buildRequest = (query: Record<string, unknown> = {}): Request =>
    ({ params: { caseReference }, query, session: {} }) as unknown as Request

  beforeEach(() => {
    jest.clearAllMocks()

    referralService = {
      getReferralNotes: jest.fn().mockResolvedValue(notesResponse),
    } as unknown as jest.Mocked<ReferralService>

    req = {
      params: {
        caseReference: 'AB1234CD',
      },
      body: {},
      session: {},
      flash: jest.fn().mockReturnValue([]),
    } as unknown as Request

    controller = new NotesController(referralService)

    NotesListPresenter.prototype.renderPage = jest.fn()
    NotesTypePresenter.prototype.renderPage = jest.fn()
    NotesCaseNoteDetailsPresenter.prototype.renderPage = jest.fn()

    res = {
      locals: { user: { username: 'testuser' } },
      redirect: jest.fn(),
    } as unknown as Response
  })

  describe('showReferralNotes', () => {
    it('fetches the first page by default and renders the notes page', async () => {
      await controller.showReferralNotes(buildRequest(), res)

      expect(referralService.getReferralNotes).toHaveBeenCalledWith(caseReference, 'testuser', {
        page: 0,
        size: 25,
      })
      expect(NotesListPresenter).toHaveBeenCalledWith(notesResponse, caseReference, undefined)
      expect(NotesListPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })

    it('shows the case note added alert once and clears the session flag', async () => {
      const request = buildRequest()
      request.session.noteAlertType = 'ADD_CASE_NOTE'

      await controller.showReferralNotes(request, res)

      expect(NotesListPresenter).toHaveBeenCalledWith(notesResponse, caseReference, 'ADD_CASE_NOTE')
      expect(request.session.noteAlertType).toBeUndefined()
    })

    it('converts the 1-based page in the query string to a 0-based API page', async () => {
      await controller.showReferralNotes(buildRequest({ page: '3' }), res)

      expect(referralService.getReferralNotes).toHaveBeenCalledWith(caseReference, 'testuser', {
        page: 2,
        size: 25,
      })
    })

    it.each([['0'], ['-4'], ['abc']])('falls back to the first page when page is %s', async page => {
      await controller.showReferralNotes(buildRequest({ page }), res)

      expect(referralService.getReferralNotes).toHaveBeenCalledWith(caseReference, 'testuser', {
        page: 0,
        size: 25,
      })
    })
  })

  describe('showNotesType', () => {
    it('renders the note type page with no session data', async () => {
      await controller.showNotesType(req, res)

      expect(NotesTypePresenter).toHaveBeenCalledWith(caseReference, undefined, undefined)
      expect(NotesTypePresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })

    it('renders the note type page with session data', async () => {
      req.session.note = { noteType: 'CASE_NOTE' }
      await controller.showNotesType(req, res)

      expect(NotesTypePresenter).toHaveBeenCalledWith(caseReference, { noteType: 'CASE_NOTE' }, undefined)
      expect(NotesTypePresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })

    it('renders the note type page with validation errors', async () => {
      res.locals.errors = {
        list: ['noteType'],
        messages: { noteType: { text: 'Select the type of note you want to add' } },
      } as ErrorMiddlewareErrors

      await controller.showNotesType(req, res)
      expect(NotesTypePresenter).toHaveBeenCalledWith(caseReference, undefined, {
        list: ['noteType'],
        messages: { noteType: { text: 'Select the type of note you want to add' } },
      })
      expect(NotesTypePresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })
  })

  describe('submitNotesType', () => {
    it('submits a note to the session and redirects', async () => {
      req.body = { noteType: 'CASE_NOTE' }
      await controller.submitNotesType(req, res)

      expect(req.session.note).toEqual({ noteType: 'CASE_NOTE' })
      expect(res.locals.errors).toBeUndefined()
      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/notes/pathways')
    })

    it('flashes an error if no type has been selected', async () => {
      req.url = '/referral/AB1234CD/notes/type'
      await controller.submitNotesType(req, res)

      expect(req.session.note).toBeUndefined()
      expect(req.flash).toHaveBeenCalledWith('noteTypeError', 'Select the type of note you want to add')
      expect(res.redirect).toHaveBeenCalledWith(req.url)
    })
  })

  describe('showPathways', () => {
    it('fetches the pathways and renders the pathways page', async () => {
      const pathways: ReferenceDataReferralPathwaysDto = { pathways: [] }
      referralService.getPathways = jest.fn().mockResolvedValue(pathways)
      NotesPathwaysPresenter.prototype.renderPage = jest.fn()

      await controller.showPathways(buildRequest(), res)

      expect(referralService.getPathways).toHaveBeenCalledWith(caseReference, 'testuser')
      expect(NotesPathwaysPresenter).toHaveBeenCalledWith(pathways, caseReference, undefined, undefined, undefined)
      expect(NotesPathwaysPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })
  })

  describe('submitPathways', () => {
    it('saves the selected pathways to the session and redirects to the details page', async () => {
      req.session.note = { noteType: 'NON_CONTACT_SESSION' }
      req.body = { pathways: ['8f0d6a2e-1b7c-4c4e-9a53-3c1f2b9e0a11', '2c9e4b7a-5d3f-4e8a-8b21-7a6f0c1d2e22'] }
      await controller.submitPathways(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/notes/non-contact-session-details')
    })

    it('handles a single selected pathway', async () => {
      req.session.note = { noteType: 'CASE_NOTE' }
      req.body = { pathways: '8f0d6a2e-1b7c-4c4e-9a53-3c1f2b9e0a11' }
      await controller.submitPathways(req, res)

      expect(req.session.note.pathways).toEqual(['8f0d6a2e-1b7c-4c4e-9a53-3c1f2b9e0a11'])
    })

    it('saves the none option so it can be re-checked', async () => {
      req.session.note = { noteType: 'CASE_NOTE' }
      req.body = { pathways: ['NONE'] }
      await controller.submitPathways(req, res)

      expect(req.session.note.pathways).toEqual(['NONE'])
      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/notes/case-note-details')
    })

    it('flashes an error and does not save when no checkbox is selected', async () => {
      req.session.note = { noteType: 'NON_CONTACT_SESSION' }
      req.url = '/referral/AB1234CD/notes/pathways'
      req.body = {}
      await controller.submitPathways(req, res)

      expect(req.session.note).toEqual({ noteType: 'NON_CONTACT_SESSION' })
      expect(req.flash).toHaveBeenCalledWith('pathwaysError', 'Select what pathway this case note relates to')
      expect(res.redirect).toHaveBeenCalledWith(req.url)
    })

    it('flashes the case note error when no checkbox is selected for a case note', async () => {
      req.session.note = { noteType: 'CASE_NOTE' }
      req.url = '/referral/AB1234CD/notes/pathways'
      req.body = {}
      await controller.submitPathways(req, res)

      expect(req.flash).toHaveBeenCalledWith(
        'pathwaysError',
        "Select what pathway this case note relates to, or select 'it does not relate to a pathway'",
      )
      expect(res.redirect).toHaveBeenCalledWith(req.url)
    })
    it('rejects the none option combined with pathways and does not save', async () => {
      req.session.note = { noteType: 'CASE_NOTE' }
      req.url = '/referral/AB1234CD/notes/pathways'
      req.body = { pathways: ['NONE', '8f0d6a2e-1b7c-4c4e-9a53-3c1f2b9e0a11'] }
      await controller.submitPathways(req, res)

      expect(req.session.note).toEqual({ noteType: 'CASE_NOTE' })
      expect(req.flash).toHaveBeenCalledWith(
        'pathwaysError',
        "Select what pathway this case note relates to, or select 'it does not relate to a pathway'",
      )
      expect(res.redirect).toHaveBeenCalledWith(req.url)
    })
  })

  describe('showCaseNoteDetails', () => {
    it('renders the case note details page with no session data', async () => {
      await controller.showCaseNoteDetails(req, res)

      expect(NotesCaseNoteDetailsPresenter).toHaveBeenCalledWith(caseReference, undefined, undefined)
      expect(NotesCaseNoteDetailsPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })

    it('renders the case note details page with session data', async () => {
      req.session.note = { noteType: 'CASE_NOTE', pathways: ['id_2', 'id_2'] }
      await controller.showCaseNoteDetails(req, res)

      expect(NotesCaseNoteDetailsPresenter).toHaveBeenCalledWith(
        caseReference,
        { noteType: 'CASE_NOTE', pathways: ['id_2', 'id_2'] },
        undefined,
      )
      expect(NotesCaseNoteDetailsPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })

    it('renders the case note details page with validation errors', async () => {
      res.locals.errors = {
        list: ['titleInput'],
        messages: { titleInput: { text: 'Enter a title for the case note' } },
      } as ErrorMiddlewareErrors

      await controller.showCaseNoteDetails(req, res)
      expect(NotesCaseNoteDetailsPresenter).toHaveBeenCalledWith(caseReference, undefined, {
        list: ['titleInput'],
        messages: { titleInput: { text: 'Enter a title for the case note' } },
      })
      expect(NotesCaseNoteDetailsPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })
  })

  describe('submitCaseNoteDetails', () => {
    it('submits the case note details to the session and redirects', async () => {
      req.body = { titleInput: 'Note title', detailsInput: 'Note details', shouldNotify: 'yes' }
      await controller.submitCaseNoteDetails(req, res)

      expect(req.session.note).toEqual({ title: 'Note title', details: 'Note details', shouldNotify: true })
      expect(res.locals.errors).toBeUndefined()
      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/notes/check-your-answers')
    })

    it('flashes errors if no data', async () => {
      req.url = '/referral/AB1234CD/notes/case-note-details'
      await controller.submitCaseNoteDetails(req, res)

      expect(req.session.note).toEqual({ title: undefined, details: undefined, shouldNotify: undefined })
      expect(req.flash).toHaveBeenCalledWith('titleInputError', 'Enter a title for the case note')
      expect(req.flash).toHaveBeenCalledWith('detailsInputError', 'Enter the details of the case note')
      expect(req.flash).toHaveBeenCalledWith(
        'shouldNotifyError',
        'Select whether you want to send an email to the probation practitioner',
      )
      expect(res.redirect).toHaveBeenCalledWith(req.url)
    })

    it('flashes errors if input too long', async () => {
      req.body = { titleInput: 'x'.repeat(101), detailsInput: 'x'.repeat(12001), shouldNotify: 'no' }
      req.url = '/referral/AB1234CD/notes/case-note-details'
      await controller.submitCaseNoteDetails(req, res)

      expect(req.session.note).toEqual({ title: 'x'.repeat(101), details: 'x'.repeat(12001), shouldNotify: false })
      expect(req.flash).toHaveBeenCalledWith('titleInputError', 'Case note title must be 100 characters or less')
      expect(req.flash).toHaveBeenCalledWith('detailsInputError', 'Case note details must be 12000 characters or less')
      expect(res.redirect).toHaveBeenCalledWith(req.url)
    })
  })

  describe('check your answers', () => {
    const completeCaseNote = {
      noteType: 'CASE_NOTE' as const,
      pathways: ['8f0d6a2e-1b7c-4c4e-9a53-3c1f2b9e0a11'],
      title: 'Note title',
      details: 'Note details',
      shouldNotify: true,
    }

    beforeEach(() => {
      res.locals.user = { username: 'user1' } as never
      referralService.getPathways = jest.fn().mockResolvedValue({ pathways: [] })
      referralService.submitCaseNote = jest.fn().mockResolvedValue({ success: true, message: 'ok' })
    })

    it('redirects to the note type page when there is no note session data', async () => {
      req.session.note = undefined
      await controller.showCheckYourAnswers(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/notes/type')
      expect(NotesCheckYourAnswersPresenter).not.toHaveBeenCalled()
    })

    it('renders the check your answers page for a complete case note', async () => {
      req.session.note = completeCaseNote
      await controller.showCheckYourAnswers(req, res)

      expect(referralService.getPathways).toHaveBeenCalledWith(caseReference, 'user1')
      expect(NotesCheckYourAnswersPresenter).toHaveBeenCalledWith(caseReference, completeCaseNote, { pathways: [] })
    })

    it('submits the case note to the API, clears the session and redirects to the notes list', async () => {
      req.session.note = completeCaseNote
      await controller.submitCheckYourAnswers(req, res)

      expect(referralService.submitCaseNote).toHaveBeenCalledWith(
        caseReference,
        {
          title: 'Note title',
          details: 'Note details',
          shouldNotify: true,
          pathways: ['8f0d6a2e-1b7c-4c4e-9a53-3c1f2b9e0a11'],
        },
        'user1',
      )
      expect(req.session.note).toBeUndefined()
      expect(req.session.noteAlertType).toBe('ADD_CASE_NOTE')
      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/notes')
    })

    it('submits an empty pathways array when the note does not relate to a pathway', async () => {
      req.session.note = { ...completeCaseNote, pathways: ['NONE'] }
      await controller.submitCheckYourAnswers(req, res)

      const [, submitted] = referralService.submitCaseNote.mock.calls[0]
      expect(submitted).toEqual({
        title: completeCaseNote.title,
        details: completeCaseNote.details,
        shouldNotify: completeCaseNote.shouldNotify,
        pathways: [],
      })
    })

    it('removes the none option from a mixed pathways list before submitting', async () => {
      req.session.note = { ...completeCaseNote, pathways: ['8f0d6a2e-1b7c-4c4e-9a53-3c1f2b9e0a11', 'NONE'] }
      await controller.submitCheckYourAnswers(req, res)

      const [, submitted] = referralService.submitCaseNote.mock.calls[0]
      expect(submitted.pathways).toEqual(['8f0d6a2e-1b7c-4c4e-9a53-3c1f2b9e0a11'])
    })

    it('does not submit when the note is incomplete', async () => {
      req.session.note = { noteType: 'CASE_NOTE' }
      await controller.submitCheckYourAnswers(req, res)

      expect(referralService.submitCaseNote).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/notes/type')
    })

    it('does not submit a non-contact activity note', async () => {
      req.session.note = { ...completeCaseNote, noteType: 'NON_CONTACT_SESSION' }
      await controller.submitCheckYourAnswers(req, res)

      expect(referralService.submitCaseNote).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/notes/type')
    })
  })
})
