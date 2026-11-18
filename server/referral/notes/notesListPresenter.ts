import type { ReferralNoteOrNonContactSessionBffDto } from '@community-support-api'
import type { PagedResponse } from '../../@types/communitySupportApi/derived'
import type { MojPagination } from '../../@types/mojFrontend'
import ReferralLayoutPresenter, { ReferralNavigationValues } from '../referralLayout/referralLayoutPresenter'
import type { ReferralNotesViewModel } from './notesListViewModel'

export default class NotesListPresenter extends ReferralLayoutPresenter<ReferralNotesViewModel> {
  constructor(
    private readonly notesResponse: PagedResponse<ReferralNoteOrNonContactSessionBffDto>,
    private readonly caseReference: string,
  ) {
    super(ReferralNavigationValues.notesTab, caseReference)
  }

  protected getTemplatePath(): string {
    return 'referral/notes'
  }

  buildViewModel(): ReferralNotesViewModel {
    const content = this.buildStaticContent()['/referral/:id/notes']
    const pagination = this.buildPagination()
    const { from, to, count } = pagination.results

    return {
      pageHeader: content.pageHeader,
      navBar: this.getMojSubNavigationArgs(),
      notesTitle: content.notesTitle,
      noNotesMessage: content.noNotesMessage,
      dateColumnHeader: content.dateColumnHeader,
      addedByColumnHeader: content.addedByColumnHeader,
      titleColumnHeader: content.titleColumnHeader,
      actionColumnHeader: content.actionColumnHeader,
      viewDetailsLinkText: content.viewDetailsLinkText,
      readFullNoteLinkText: content.readFullNoteLinkText,
      // Placeholder until the note details page exists
      viewDetailsHref: `/referral/${this.caseReference}/notes`,
      addNoteButtonText: content.addNoteButtonText,
      // Placeholder until the add note page exists
      addNoteHref: `/referral/${this.caseReference}/notes`,
      addedNotesSubheading: content.addedNotesSubheading,
      notes: this.notesResponse.content.map(note => ({
        createdAt: note.createdAt,
        createdBy: note.createdBy,
        title: note.title,
        details: note.details,
        detailsTruncated: note.detailsTruncated,
      })),
      hasNotes: this.notesResponse.content.length > 0,
      pagination,
      resultsSummary: content.resultsSummaryText
        .replace('{{ from }}', from)
        .replace('{{ to }}', to)
        .replace('{{ count }}', count),
    }
  }

  private buildPagination(): MojPagination {
    const basePath = `/referral/${this.caseReference}/notes`
    const currentPage = this.notesResponse.page + 1
    const { totalPages, size, totalElements } = this.notesResponse

    const pagination = {} as MojPagination
    if (currentPage > 1) {
      pagination.previous = { href: `${basePath}?page=${currentPage - 1}` }
    }
    if (totalPages > currentPage) {
      pagination.next = { href: `${basePath}?page=${currentPage + 1}` }
    }
    pagination.attributes = {
      'data-testid': 'referral-notes-pagination',
    }
    pagination.items = this.buildPaginationItems(currentPage, totalPages, basePath)
    pagination.results = this.buildPaginationResults(currentPage, size, totalElements)
    return pagination
  }

  private buildPaginationResults(currentPage: number, size: number, totalElements: number) {
    const from = (currentPage - 1) * size + 1
    const to = Math.min(currentPage * size, totalElements)
    return {
      count: totalElements.toString(),
      from: from.toString(),
      to: to.toString(),
      text: 'results',
    }
  }

  private buildPaginationItems(current: number, total: number, basePath: string) {
    const start = Math.max(1, current - 1)
    const length = Math.min(start + 2, total)
    const items = []
    // eslint-disable-next-line no-plusplus
    for (let i = start; i <= length; i++) {
      items.push({
        number: i.toString(),
        current: i === current,
        href: `${basePath}?page=${i}`,
      })
    }
    return items
  }
}
