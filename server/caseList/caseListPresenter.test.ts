import { Response } from 'express'
import { CaseList } from '@community-support-api'
import type { CaseListContent, CaseListViewModel } from './caseListViewModel'
import CaseListPresenter from './caseListPresenter'
import CaseListContentFactory from '../testutils/factories/CaselistContent'
import { PagedResponse } from '../@types/communitySupportApi/derived'

describe('caseListPresenter', () => {
  let res: Response
  let content: CaseListContent
  beforeEach(() => {
    content = CaseListContentFactory.build()
    res = {
      locals: { content },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response
  })
  describe('renderPage', () => {
    it('should render the found person page with the correct content and summary list', () => {
      const caseList: PagedResponse<CaseList> = {
        content: [
          {
            personName: 'John Doe',
            personIdentifier: 'CRN123',
            caseWorkers: ['Worker 1', 'Worker 2'],
            date: '2024-01-01',
          } as CaseList,
        ],
        page: 0,
        size: 10,
        totalElements: 1,
        totalPages: 1,
      } as unknown as PagedResponse<CaseList>
      const presenter = new CaseListPresenter(caseList, 'unassigned')
      presenter.renderPage(res)
      expect(res.render).toHaveBeenCalledWith('caseList/caseList', expect.objectContaining({} as CaseListViewModel))
    })
  })
})
