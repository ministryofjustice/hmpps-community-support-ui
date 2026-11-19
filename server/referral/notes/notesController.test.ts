import type { Request, Response } from 'express'
import type { ReferralNoteOrNonContactSessionBffDto } from '@community-support-api'
import type { PagedResponse } from '../../@types/communitySupportApi/derived'
import ReferralService from '../../services/referralService'
import NotesController from './notesController'
import NotesListPresenter from './notesListPresenter'

jest.mock('../../services/referralService')
jest.mock('./notesListPresenter')

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
  let referralService: jest.Mocked<ReferralService>
  let controller: NotesController

  const buildRequest = (query: Record<string, unknown> = {}): Request =>
    ({ params: { caseReference }, query }) as unknown as Request

  beforeEach(() => {
    jest.clearAllMocks()

    referralService = {
      getReferralNotes: jest.fn().mockResolvedValue(notesResponse),
    } as unknown as jest.Mocked<ReferralService>

    controller = new NotesController(referralService)

    NotesListPresenter.prototype.renderPage = jest.fn()

    res = {
      locals: { user: { username: 'testuser' } },
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
})
