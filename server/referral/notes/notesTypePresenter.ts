import { GovukFrontendDetails, GovukFrontendRadios } from '@govuk-frontend'
import ReferralLayoutPresenter, { ReferralNavigationValues } from '../referralLayout/referralLayoutPresenter'
import { NotesTypeContent, NotesTypeViewModel } from './notesTypeViewModel'
import { escapeHtml } from '../../utils/utils'
import { ErrorMiddlewareErrors, NoteData } from '../../@types/express'

export default class NotesTypePresenter extends ReferralLayoutPresenter<NotesTypeViewModel> {
  constructor(
    private readonly caseReference: string,
    private readonly sessionData?: NoteData,
    private readonly validationErrors?: ErrorMiddlewareErrors,
  ) {
    super(ReferralNavigationValues.notesTab, caseReference)
  }

  protected getTemplatePath(): string {
    return 'referral/notesType'
  }

  private buildDetails(title: string, description: string): GovukFrontendDetails {
    return {
      summaryText: escapeHtml(title),
      html: description,
    }
  }

  private buildNoteTypeRadio(caseNoteOption: string, nonContactSessionOption: string): GovukFrontendRadios {
    return {
      name: 'noteType',
      errorMessage: this.validationErrors?.messages.noteType ?? null,
      items: [
        {
          text: caseNoteOption,
          value: 'CASE_NOTE',
          checked: this.sessionData?.noteType === 'CASE_NOTE',
        },
        {
          text: nonContactSessionOption,
          value: 'NON_CONTACT_SESSION',
          checked: this.sessionData?.noteType === 'NON_CONTACT_SESSION',
        },
      ],
    }
  }

  buildViewModel(): NotesTypeViewModel {
    const content: NotesTypeContent = this.buildStaticContent()['/referral/:id/notes/type']

    return {
      pageHeader: content.pageHeader,
      backLink: { href: `/referral/${this.caseReference}/notes` },
      description: content.description,
      details: this.buildDetails(content.detailsTitle, content.detailsDescription),
      noteTypeRadio: this.buildNoteTypeRadio(content.radioCaseNote, content.radioNonContactActivity),
      continueButton: { text: content.continueText },
      continueButtonLink: `/referral/${this.caseReference}/notes/type`,
    }
  }
}
