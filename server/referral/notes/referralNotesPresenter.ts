import type { Response } from 'express'
import type { ReferralNotesAndNonContactSessionsBffResponseDto } from '@community-support-api'
import ReferralLayoutPresenter, { ReferralNavigationValues } from '../referralLayout/referralLayoutPresenter'
import type { ReferralNotesContent, ReferralNotesViewModel } from './referralNotesViewModel'

export default class ReferralNotesPresenter extends ReferralLayoutPresenter<
  ReferralNotesViewModel,
  ReferralNotesContent
> {
  constructor(
    private readonly referralNotes: ReferralNotesAndNonContactSessionsBffResponseDto,
    private readonly caseReference: string,
  ) {
    super(ReferralNavigationValues.notesTab, caseReference)
  }

  protected getTemplatePath(): string {
    return 'referral/notes'
  }

  buildViewModel(res: Response): ReferralNotesViewModel {
    const content = this.buildStaticContent(res)
    const { notesAndNonContactSessions } = this.referralNotes

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
      // Placeholder until the note details page exists
      viewDetailsHref: `/referral/${this.caseReference}/notes`,
      addNoteButtonText: content.addNoteButtonText,
      // Placeholder until the add note page exists
      addNoteHref: `/referral/${this.caseReference}/notes`,
      addedNotesSubheading: content.addedNotesSubheading,
      notes: notesAndNonContactSessions.map(note => ({
        createdAt: note.createdAt,
        createdBy: note.createdBy,
        title: note.title,
        details: note.details,
        detailsTruncated: note.detailsTruncated,
      })),
      hasNotes: notesAndNonContactSessions.length > 0,
    }
  }
}
