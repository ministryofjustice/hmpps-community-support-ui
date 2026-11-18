import type { MojPagination, MojSubNavigation } from '@moj-frontend'

export type ReferralNoteRow = {
  createdAt: string
  createdBy: string
  title: string
  details: string
  detailsTruncated: boolean
}

export type ReferralNotesViewModel = {
  pageHeader: string
  navBar: MojSubNavigation
  notesTitle: string
  noNotesMessage: string
  dateColumnHeader: string
  addedByColumnHeader: string
  titleColumnHeader: string
  actionColumnHeader: string
  viewDetailsLinkText: string
  readFullNoteLinkText: string
  viewDetailsHref: string
  addNoteButtonText: string
  addNoteHref: string
  addedNotesSubheading: string
  notes: ReferralNoteRow[]
  hasNotes: boolean
  pagination: MojPagination
  resultsSummary: string
}
