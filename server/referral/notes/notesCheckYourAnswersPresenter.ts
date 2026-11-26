import type { ReferenceDataReferralPathwaysDto } from '@community-support-api'
import type { GovukFrontendSummaryListRow } from '@govuk-frontend'
import ReferralLayoutPresenter, { ReferralNavigationValues } from '../referralLayout/referralLayoutPresenter'
import { NoteData } from '../../@types/express'
import { NO_PATHWAY_VALUE } from '../../validation/NotesPathwaysFormData'
import { escapeSpecialHtmlCharacters } from '../../utils/viewUtils'
import { NotesCheckYourAnswersContent, NotesCheckYourAnswersViewModel } from './notesCheckYourAnswersViewModel'

export default class NotesCheckYourAnswersPresenter extends ReferralLayoutPresenter<NotesCheckYourAnswersViewModel> {
  constructor(
    private readonly caseReference: string,
    private readonly sessionData: NoteData,
    private readonly pathwaysResponse: ReferenceDataReferralPathwaysDto,
  ) {
    super(ReferralNavigationValues.notesTab, caseReference)
  }

  protected getTemplatePath(): string {
    return 'referral/notesCheckYourAnswers'
  }

  private buildRow(
    label: string,
    value: GovukFrontendSummaryListRow['value'],
    changeHref: string,
    content: NotesCheckYourAnswersContent,
  ): GovukFrontendSummaryListRow {
    return {
      key: { text: label },
      value,
      actions: {
        items: [
          {
            href: `/referral/${this.caseReference}${changeHref}`,
            text: content.changeLinkText,
            visuallyHiddenText: label.toLowerCase(),
          },
        ],
      },
    }
  }

  private buildPathwaysValue(content: NotesCheckYourAnswersContent): GovukFrontendSummaryListRow['value'] {
    if (this.sessionData.pathways?.includes(NO_PATHWAY_VALUE)) {
      return { text: content.noPathwayText }
    }
    const titles = this.pathwaysResponse.pathways
      .filter(pathway => this.sessionData.pathways?.includes(pathway.id))
      .map(pathway => escapeSpecialHtmlCharacters(pathway.title))
    return { html: titles.join('<br>') }
  }

  private buildSummaryRows(content: NotesCheckYourAnswersContent): GovukFrontendSummaryListRow[] {
    const isCaseNote = this.sessionData.noteType === 'CASE_NOTE'
    return [
      this.buildRow(
        content.noteTypeLabel,
        { text: isCaseNote ? content.caseNoteType : content.nonContactNoteType },
        '/notes/type',
        content,
      ),
      this.buildRow(content.pathwayLabel, this.buildPathwaysValue(content), '/notes/pathways', content),
      this.buildRow(
        isCaseNote ? content.caseNoteTitleLabel : content.nonContactTitleLabel,
        { text: this.sessionData.title ?? '' },
        '/notes/case-note-details',
        content,
      ),
      this.buildRow(
        isCaseNote ? content.caseNoteDetailsLabel : content.nonContactDetailsLabel,
        { html: escapeSpecialHtmlCharacters(this.sessionData.details ?? '').replace(/\r?\n/g, '<br>') },
        '/notes/case-note-details',
        content,
      ),
      ...(isCaseNote
        ? [
            this.buildRow(
              content.shouldNotifyLabel,
              { text: this.sessionData.shouldNotify ? content.yesText : content.noText },
              '/notes/case-note-details',
              content,
            ),
          ]
        : []),
    ]
  }

  buildViewModel(): NotesCheckYourAnswersViewModel {
    const content: NotesCheckYourAnswersContent = this.globalContent().referral.id.notes['check-your-answers']

    return {
      pageTitle: content.pageTitle,
      pageHeader: content.pageHeader,
      detailsSubHeader: content.detailsSubHeader,
      backLink: {
        href: `/referral/${this.caseReference}/notes/${
          this.sessionData.noteType === 'CASE_NOTE' ? 'case-note-details' : 'non-contact-session-details'
        }`,
      },
      summaryList: { rows: this.buildSummaryRows(content) },
      submitButton: { text: content.submitButtonText, preventDoubleClick: true },
      submitHref: `/referral/${this.caseReference}/notes/check-your-answers`,
    }
  }
}
