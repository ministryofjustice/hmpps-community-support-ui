import { Request, Response } from 'express'
import CaseListService from '../services/caseListService'
import CaseListPresenter from './caseListPresenter'

class CaseListController {
  constructor(private caseListService: CaseListService) {}

  async showCaseList(req: Request, res: Response) {
    const selectedTab = (req.query.selected as string) || 'unassigned'
    const currentPage = parseInt(req.query.page as string, 10) || 1
    const caseListResponse = await this.caseListService.getCaseList(
      res.locals.user.username,
      { page: currentPage - 1, size: 10 },
      selectedTab === 'inProgress',
    )

    const presenter = new CaseListPresenter(caseListResponse, selectedTab)

    return presenter.renderPage(res)
  }
}

export default CaseListController
