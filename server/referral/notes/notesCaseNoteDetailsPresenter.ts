import { GovukFrontendCharacterCount, GovukFrontendInput, GovukFrontendRadios } from '@govuk-frontend'
import ReferralLayoutPresenter, { ReferralNavigationValues } from '../referralLayout/referralLayoutPresenter'
import { NotesCaseNoteDetailsContent, NotesCaseNoteDetailsViewModel } from './notesCaseNoteDetailsViewModel'
import { ErrorMiddlewareErrors, NoteData } from '../../@types/express'

export default class NotesCaseNoteDetailsPresenter extends ReferralLayoutPresenter<NotesCaseNoteDetailsViewModel> {
  constructor(
    private readonly caseReference: string,
    private readonly sessionData?: NoteData,
    private readonly validationErrors?: ErrorMiddlewareErrors,
  ) {
    super(ReferralNavigationValues.notesTab, caseReference)
  }

  protected getTemplatePath(): string {
    return 'referral/notesCaseNoteDetails'
  }

  private buildTitleInput(content: NotesCaseNoteDetailsContent): GovukFrontendInput {
    return {
      name: 'titleInput',
      label: { text: content.titleLabel, classes: 'govuk-label--m' },
      value: this.sessionData?.title || '',
      errorMessage: this.validationErrors?.messages.titleInput,
    }
  }

  private buildDetails(content: NotesCaseNoteDetailsContent): GovukFrontendCharacterCount {
    return {
      name: 'detailsInput',
      maxlength: content.detailsMaxLength,
      maxwords: null,
      label: { text: content.detailsLabel, classes: 'govuk-label--m' },
      value: this.sessionData?.details || '',
      errorMessage: this.validationErrors?.messages.detailsInput,
    }
  }

  private buildShouldNotifyRadio(content: NotesCaseNoteDetailsContent): GovukFrontendRadios {
    return {
      name: 'shouldNotify',
      attributes: { 'data-testid': 'shouldNotifyRadio' },
      fieldset: {
        legend: { text: content.shouldNotifyLabel, classes: 'govuk-fieldset__legend--m' },
      },
      hint: { text: content.shouldNotifyHint },
      errorMessage: this.validationErrors?.messages.shouldNotify,
      items: [
        { value: 'yes', text: 'Yes', checked: this.sessionData?.shouldNotify === true },
        { value: 'no', text: 'No', checked: this.sessionData?.shouldNotify === false },
      ],
    }
  }

  buildViewModel(): NotesCaseNoteDetailsViewModel {
    const content: NotesCaseNoteDetailsContent = this.globalContent().referral.id.notes['case-note-details']

    return {
      pageHeader: content.pageHeader,
      backLink: { href: `/referral/${this.caseReference}/notes/pathways` },
      titleInput: this.buildTitleInput(content),
      detailsCharacterCount: this.buildDetails(content),
      shouldNotifyRadio: this.buildShouldNotifyRadio(content),
      continueButton: { text: content.continueText },
      continueButtonLink: `/referral/${this.caseReference}/notes/case-note-details`,
    }
  }
}
