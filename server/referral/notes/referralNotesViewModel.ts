import type { MojSubNavigation } from '@moj-frontend'
import { GlobalContent } from '../../../assets/content/GlobalContent'

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
  viewDetailsHref: string
  notes: ReferralNoteRow[]
  hasNotes: boolean
}

export type ReferralNotesContent = GlobalContent['/referral/:id/notes']
