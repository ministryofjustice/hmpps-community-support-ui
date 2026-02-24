import { Request, Response } from 'express'
import { CaseList } from '@community-support-api'
import CaseListController from './caseListController'
import CaseListService from '../services/caseListService'
import CaseListPresenter from './caseListPresenter'

jest.mock('../services/caseListService')
jest.mock('./caseListPresenter')

describe('CaseListController', () => {
  let req: Request
  let res: Response
  let caseListController: CaseListController
  let caseListService: jest.Mocked<CaseListService>

  beforeEach(() => {
    caseListService = {
      getCaseList: jest.fn(),
    } as unknown as jest.Mocked<CaseListService>

    caseListController = new CaseListController(caseListService)

    CaseListPresenter.prototype.renderPage = jest.fn()

    req = {
      query: { selected: 'unassigned', page: '1' },
    } as unknown as Request

    res = {
      render: jest.fn(),
      locals: { user: { username: 'testuser' } },
    } as unknown as Response
  })

  describe('showCaseList', () => {
    it('should render the case list page', async () => {
      const mockCaseListResponse = {
        content: [{} as CaseList],
        page: 0,
        size: 10,
        totalElements: 1,
        totalPages: 1,
      }
      caseListService.getCaseList.mockResolvedValue(mockCaseListResponse)
      await caseListController.showCaseList(req, res)

      expect(CaseListPresenter).toHaveBeenCalledWith(mockCaseListResponse, req.query.selected)
      expect(CaseListPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })
  })
})
