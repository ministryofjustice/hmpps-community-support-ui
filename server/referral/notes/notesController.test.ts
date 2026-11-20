import type { Request, Response } from 'express'
import type { ReferralNoteOrNonContactSessionBffDto, ReferenceDataReferralPathwaysDto } from '@community-support-api'
import type { PagedResponse } from '../../@types/communitySupportApi/derived'
import ReferralService from '../../services/referralService'
import NotesController from './notesController'
import NotesListPresenter from './notesListPresenter'
import NotesTypePresenter from './notesTypePresenter'
import NotesPathwaysPresenter from './notesPathwaysPresenter'
import type { ErrorMiddlewareErrors } from '../../@types/express'

jest.mock('../../services/referralService')
jest.mock('./notesListPresenter')
jest.mock('./notesTypePresenter')
jest.mock('./notesPathwaysPresenter')

describe('NotesController', () => {
  const caseReference = 'AB1234CD'
  const notesResponse: PagedResponse<ReferralNoteOrNonContactSessionBffDto> = {
    content: [],
    page: 0,
    size: 25,
    totalElements: 0,
    totalPages: 0,
  }

  let res: Response
  let req: Request
  let referralService: jest.Mocked<ReferralService>
  let controller: NotesController

  const buildRequest = (query: Record<string, unknown> = {}): Request =>
    ({ params: { caseReference }, query }) as unknown as Request

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
      expect(NotesListPresenter).toHaveBeenCalledWith(notesResponse, caseReference)
      expect(NotesListPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
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
      expect(NotesPathwaysPresenter).toHaveBeenCalledWith(pathways, caseReference, undefined, undefined)
      expect(NotesPathwaysPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })
  })

  describe('submitPathways', () => {
    it('saves the selected pathways to the session and redirects to the details page', async () => {
      req.session.note = { noteType: 'NON_CONTACT_SESSION' }
      req.body = { pathways: ['id-1', 'id-2'] }
      await controller.submitPathways(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/notes/non-contact-session-details')
    })

    it('handles a single selected pathway', async () => {
      req.session.note = { noteType: 'CASE_NOTE' }
      req.body = { pathways: 'id-1' }
      await controller.submitPathways(req, res)

      expect(req.session.note.pathways).toEqual(['id-1'])
    })

    it('saves no pathways when the none option is selected', async () => {
      req.session.note = { noteType: 'CASE_NOTE' }
      req.body = { pathways: ['NONE'] }
      await controller.submitPathways(req, res)

      expect(req.session.note.pathways).toEqual([])
      expect(res.redirect).toHaveBeenCalledWith('/referral/AB1234CD/notes/case-note-details')
    })

    it('flashes an error and does not save when no checkbox is selected', async () => {
      req.session.note = { noteType: 'NON_CONTACT_SESSION' }
      req.url = '/referral/AB1234CD/notes/pathways'
      req.body = {}
      await controller.submitPathways(req, res)

      expect(req.session.note).toEqual({ noteType: 'NON_CONTACT_SESSION' })
      expect(req.flash).toHaveBeenCalledWith('pathwaysError', 'Select at least one pathway')
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
      req.body = { pathways: ['NONE', 'id-1'] }
      await controller.submitPathways(req, res)

      expect(req.session.note).toEqual({ noteType: 'CASE_NOTE' })
      expect(req.flash).toHaveBeenCalledWith(
        'pathwaysError',
        "Select what pathway this case note relates to, or select 'it does not relate to a pathway'",
      )
      expect(res.redirect).toHaveBeenCalledWith(req.url)
    })
  })
})
