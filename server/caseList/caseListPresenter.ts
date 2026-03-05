import { Response } from 'express'
import { CaseList } from '@community-support-api'
import { GovukFrontendPagination, GovukFrontendTable, GovukFrontendTableRow } from '@govuk-frontend'
import PresenterBase from '../presenter/presenterBase'
import { CaseListCase, CaseListContent, CaseListViewModel } from './caseListViewModel'
import { MojSubNavigation } from '../@types/mojFrontend'
import { PagedResponse } from '../@types/communitySupportApi/derived'

export default class CaseListPresenter extends PresenterBase<CaseListViewModel> {
  private caseList: Array<CaseList>

  private parsedCaseList: Array<CaseListCase>

  private readonly currentPath: string

  constructor(
    private readonly caseListResponse: PagedResponse<CaseList>,
    private readonly selectedTab: string,
  ) {
    super()
    this.currentPath = this.selectedTab === 'inProgress' ? '/cases-in-progress' : '/unassigned-cases'
    this.caseList = this.caseListResponse.content
    this.parsedCaseList = this.buildCaseList(this.caseList)
  }

  protected override buildPageContent(res: Response): CaseListViewModel {
    const viewModel = {} as CaseListViewModel
    viewModel.staticContent = this.buildStaticContent(res)
    viewModel.navBar = this.buildSubNav(viewModel.staticContent)
    viewModel.hasCases = this.caseListResponse.totalElements > 0
    if (viewModel.hasCases) {
      viewModel.pagination = this.buildPagination()
      viewModel.caseListTable = this.buildCaseListTable(viewModel.staticContent, this.selectedTab)
    }

    viewModel.noCasesTitle =
      this.selectedTab === 'inProgress'
        ? viewModel.staticContent.inProgressSubNavTitle
        : viewModel.staticContent.unassignedSubNavTitle
    viewModel.staticContent.noCasesMessage = viewModel.staticContent.noCasesMessage.replace(
      '{0}',
      this.selectedTab === 'inProgress' ? 'in progress' : 'unassigned',
    )
    return viewModel
  }

  protected buildStaticContent(res: Response): CaseListContent {
    const { content } = res.locals
    return content as CaseListContent
  }

  private buildCaseList(cases: Array<CaseList>): Array<CaseListCase> {
    return cases.map(caseItem => ({
      name: caseItem.personName,
      crnOrPrisonNumber: caseItem.personIdentifier,
      caseWorkers: caseItem.caseWorkers,
      dateReceived: caseItem.date,
    }))
  }

  private buildSubNav(content: CaseListContent): MojSubNavigation {
    return {
      label: this.selectedTab === 'inProgress' ? content.inProgressSubNavTitle : content.unassignedSubNavTitle,
      items: this.buildSubNavItems(content),
    }
  }

  private buildSubNavItems(content: CaseListContent): Array<{ text: string; href: string; active?: boolean }> {
    return content.subNavItems.map(item => ({
      text: item.title,
      href: item.href,
      active: item.id === this.selectedTab,
    }))
  }

  private buildPagination(): GovukFrontendPagination {
    const currentPage = this.caseListResponse.page + 1
    const { totalPages } = this.caseListResponse
    if (totalPages <= 1) {
      return null
    }
    const pagination = {} as GovukFrontendPagination
    if (currentPage > 1) {
      pagination.previous = {
        href: `${this.currentPath}?page=${currentPage - 1}&selected=${this.selectedTab}`,
      }
    }
    if (this.caseListResponse.totalPages > currentPage) {
      pagination.next = {
        href: `${this.currentPath}?page=${currentPage + 1}&selected=${this.selectedTab}`,
      }
    }
    pagination.attributes = {
      'data-testid': 'caselist-pagination',
    }
    pagination.items = this.buildPaginationItems(currentPage, totalPages)
    return pagination
  }

  private buildPaginationItems(current: number, total: number) {
    const start = Math.max(1, current - 1)
    const length = Math.min(start + 2, total)
    const items = []
    // eslint-disable-next-line no-plusplus
    for (let i = start; i <= length; i++) {
      items.push({
        number: i.toString(),
        current: i === current,
        href: `${this.currentPath}?page=${i}&selected=${this.selectedTab}`,
      })
    }
    return items
  }

  private buildCaseListTable(content: CaseListContent, selectedTab: string): GovukFrontendTable {
    let columnHeaders: Array<string>
    if (selectedTab === 'inProgress') {
      columnHeaders = content.inProgressColumnHeaders
    } else {
      columnHeaders = content.unassignedColumnHeaders
    }
    return {
      attributes: {
        'data-module': 'moj-sortable-table',
        'data-testid': 'case-list-table',
      },
      caption: selectedTab === 'inProgress' ? content.inProgressSubNavTitle : content.unassignedSubNavTitle,
      captionClasses: 'govuk-table__caption--m',
      head: this.buildColumnHeaders(columnHeaders),
      rows: selectedTab === 'inProgress' ? this.buildInProgressTableRows() : this.buildUnassignedTableRows(),
    }
  }

  private buildColumnHeaders(items: Array<string>): Array<{ text: string }> {
    return items.map((header, index) => ({
      text: header,
      attributes: {
        'data-column': index.toString(),
        'aria-sort': index === 0 ? 'ascending' : 'none',
      },
    }))
  }

  private buildUnassignedTableRows(): Array<GovukFrontendTableRow> {
    return this.parsedCaseList.map(caseItem => [
      {
        html: `<a href="/case/${caseItem.crnOrPrisonNumber}"><strong>${caseItem.name}</strong></a>`,
        classes: 'govuk-!-width-one-quarter',
        attributes: {
          'data-sort-value': `${caseItem.name.toLowerCase().split(', ')[0]}`,
        },
      },
      {
        text: caseItem.crnOrPrisonNumber,
      },
      {
        text: caseItem.dateReceived,
      },
    ])
  }

  private buildInProgressTableRows(): GovukFrontendTableRow[] {
    return this.parsedCaseList.map(caseItem => [
      {
        html: `<a href="/case/${caseItem.crnOrPrisonNumber}"><strong>${caseItem.name}</strong></a>`,
        classes: 'govuk-!-width-one-quarter',
        attributes: {
          'data-sort-value': `${caseItem.name.toLowerCase().split(', ')[0]}`,
        },
      },
      {
        text: caseItem.crnOrPrisonNumber,
      },
      {
        html: `<p>${caseItem.caseWorkers.join(',<br />')}</p>`,
      },
      {
        text: caseItem.dateReceived,
      },
    ])
  }

  protected override getTemplatePath(): string {
    return 'caseList/caseList'
  }
}
