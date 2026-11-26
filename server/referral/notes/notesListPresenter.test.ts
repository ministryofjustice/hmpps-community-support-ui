import type { ReferralNoteOrNonContactSessionBffDto } from '@community-support-api'
import type { PagedResponse } from '../../@types/communitySupportApi/derived'
import NotesListPresenter from './notesListPresenter'

describe('NotesListPresenter', () => {
  const caseReference = 'AB1234CD'

  const note = (title: string, detailsTruncated = false) =>
    ({
      createdAt: '2026-10-09T14:30:00',
      createdBy: 'Jane Smith',
      title,
      details: 'Some details about the referral',
      detailsTruncated,
    }) as unknown as ReferralNoteOrNonContactSessionBffDto

  const pagedResponse = (
    overrides: Partial<PagedResponse<ReferralNoteOrNonContactSessionBffDto>>,
  ): PagedResponse<ReferralNoteOrNonContactSessionBffDto> => ({
    content: [note('First note'), note('Second note', true)],
    page: 0,
    size: 25,
    totalElements: 2,
    totalPages: 1,
    ...overrides,
  })

  it('maps notes and marks the notes tab as active', () => {
    const viewModel = new NotesListPresenter(pagedResponse({}), caseReference).buildViewModel()

    expect(viewModel.pageTitle).toBe('Notes - Community Support')
    expect(viewModel.pageHeader).toBe('Referral for')
    expect(viewModel.addNoteButton).toEqual({
      text: 'Add note',
      href: `/referral/${caseReference}/notes/type`,
      attributes: { 'data-testid': 'add-note-button' },
    })
    expect(viewModel.notesTitle).toBe('Notes')
    expect(viewModel.hasNotes).toBe(true)
    expect(viewModel.notes).toEqual([
      {
        createdAt: '2026-10-09T14:30:00',
        createdBy: 'Jane Smith',
        title: 'First note',
        details: 'Some details about the referral',
        detailsTruncated: false,
      },
      {
        createdAt: '2026-10-09T14:30:00',
        createdBy: 'Jane Smith',
        title: 'Second note',
        details: 'Some details about the referral',
        detailsTruncated: true,
      },
    ])
    expect(viewModel.navBar.items.find(item => item.active)?.text).toBe('Notes')
    expect(viewModel.navBar.items.find(item => item.active)?.href).toBe(`/referral/${caseReference}/notes`)
  })

  it('shows the results summary for a single page', () => {
    const viewModel = new NotesListPresenter(pagedResponse({}), caseReference).buildViewModel()

    expect(viewModel.resultsSummary).toBe('Showing 1 to 2 of 2 total results')
  })

  it('reports an empty list without notes', () => {
    const viewModel = new NotesListPresenter(
      pagedResponse({ content: [], totalElements: 0, totalPages: 0 }),
      caseReference,
    ).buildViewModel()

    expect(viewModel.hasNotes).toBe(false)
    expect(viewModel.notes).toEqual([])
    expect(viewModel.pagination.previous).toBeUndefined()
    expect(viewModel.pagination.next).toBeUndefined()
  })

  it('builds previous and next links on a middle page', () => {
    const viewModel = new NotesListPresenter(
      pagedResponse({ page: 1, size: 25, totalElements: 60, totalPages: 3 }),
      caseReference,
    ).buildViewModel()

    expect(viewModel.resultsSummary).toBe('Showing 26 to 50 of 60 total results')
    expect(viewModel.pagination.previous).toEqual({ href: `/referral/${caseReference}/notes?page=1` })
    expect(viewModel.pagination.next).toEqual({ href: `/referral/${caseReference}/notes?page=3` })
    expect(viewModel.pagination.attributes).toEqual({ 'data-testid': 'referral-notes-pagination' })
    expect(viewModel.pagination.items).toEqual([
      { number: '1', current: false, href: `/referral/${caseReference}/notes?page=1` },
      { number: '2', current: true, href: `/referral/${caseReference}/notes?page=2` },
      { number: '3', current: false, href: `/referral/${caseReference}/notes?page=3` },
    ])
  })

  it('omits the next link on the last page', () => {
    const viewModel = new NotesListPresenter(
      pagedResponse({ page: 2, size: 25, totalElements: 60, totalPages: 3 }),
      caseReference,
    ).buildViewModel()

    expect(viewModel.resultsSummary).toBe('Showing 51 to 60 of 60 total results')
    expect(viewModel.pagination.previous).toEqual({ href: `/referral/${caseReference}/notes?page=2` })
    expect(viewModel.pagination.next).toBeUndefined()
  })
})
