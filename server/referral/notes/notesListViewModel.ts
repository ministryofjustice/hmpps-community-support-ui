import type { MojAlert, MojPagination, MojSubNavigation } from '@moj-frontend'

export type ReferralNoteRow = {
  createdAt: string
  createdBy: string
  title: string
  details: string
  detailsTruncated: boolean
}

export type ReferralNotesViewModel = {
  pageTitle: string
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
  addNoteButton: {
    text: string
    href: string
    attributes: Record<string, string>
  }
  addedNotesSubheading: string
  notes: ReferralNoteRow[]
  hasNotes: boolean
  pagination: MojPagination
  resultsSummary: string
  alert?: MojAlert
}
