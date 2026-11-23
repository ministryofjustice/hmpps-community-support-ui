import type { ReferenceDataReferralPathwaysDto } from '@community-support-api'
import type { GovukFrontendCheckboxesItem } from '@govuk-frontend'
import ReferralLayoutPresenter, { ReferralNavigationValues } from '../referralLayout/referralLayoutPresenter'
import { NotesPathwaysContent, NotesPathwaysModel } from './notesPathwaysModels'
import { ErrorMiddlewareErrors } from '../../@types/express'
import { NO_PATHWAY_VALUE } from '../../validation/NotesPathwaysFormData'

export default class NotesPathwaysPresenter extends ReferralLayoutPresenter<NotesPathwaysModel> {
  constructor(
    private readonly pathwaysResponse: ReferenceDataReferralPathwaysDto,
    private readonly caseReference: string,
    private readonly noteType?: string,
    private readonly validationErrors?: ErrorMiddlewareErrors,
  ) {
    super(ReferralNavigationValues.notesTab, caseReference)
  }

  protected getTemplatePath(): string {
    return 'notes/pathways'
  }

  buildViewModel(): NotesPathwaysModel {
    const isCaseNote = this.noteType === 'CASE_NOTE'
    const content: NotesPathwaysContent = this.globalContent().referral.id.notes.pathways

    const pathwayItems: GovukFrontendCheckboxesItem[] = this.pathwaysResponse.pathways.map(pathway => ({
      value: pathway.id,
      text: pathway.title,
    }))

    const pageHeader = isCaseNote ? content.pageHeader : content.nonContactPageHeader
    const items: GovukFrontendCheckboxesItem[] = isCaseNote
      ? [
          ...pathwayItems,
          { value: '', divider: 'or' },
          { value: NO_PATHWAY_VALUE, text: content.noPathwayOption, behaviour: 'exclusive' },
        ]
      : pathwayItems

    return {
      pageTitle: isCaseNote ? content.pageTitle : content.nonContactPageTitle,
      pageHeader,
      checkboxes: {
        name: 'pathways',
        idPrefix: 'pathways',
        fieldset: {
          legend: {
            text: pageHeader,
            isPageHeading: true,
            classes: 'govuk-fieldset__legend--l',
          },
        },
        hint: { text: content.hint },
        errorMessage: this.validationErrors?.messages.pathways ?? null,
        items,
      },
      button: { text: content.button },
      backLink: { href: `/referral/${this.caseReference}/notes/type` },
    }
  }
}
