import { Response } from 'express'
import { CaseList } from '@community-support-api'
import type { CaseListContent, CaseListViewModel } from './caseListViewModel'
import CaseListPresenter from './caseListPresenter'
import CaseListContentFactory from '../testutils/factories/CaselistContent'
import { PagedResponse } from '../@types/communitySupportApi/derived'
import { globalContent } from '../../assets/content/GlobalContent'

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
    it('does not replace placeholders in the shared content across requests', () => {
      const emptyCases: PagedResponse<CaseList> = {
        content: [],
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0,
      }
      const unassignedMessage = globalContent.unassignedCases.noCasesMessage
      const inProgressMessage = globalContent.casesInProgress.noCasesMessage

      for (const tab of ['unassigned', 'inProgress', 'unassigned']) {
        new CaseListPresenter(emptyCases, tab).renderPage(res)
      }

      const renderData = (res.render as jest.Mock).mock.calls.map(
        ([, viewModel]: [string, { content: CaseListViewModel }]) => viewModel.content,
      )
      expect(renderData.map(model => model.staticContent.noCasesMessage)).toEqual([
        unassignedMessage.replace('{0}', 'unassigned'),
        inProgressMessage.replace('{0}', 'in progress'),
        unassignedMessage.replace('{0}', 'unassigned'),
      ])
      expect(globalContent.unassignedCases.noCasesMessage).toBe(unassignedMessage)
      expect(globalContent.casesInProgress.noCasesMessage).toBe(inProgressMessage)
    })

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
