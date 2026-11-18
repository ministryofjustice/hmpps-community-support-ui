import { Response } from 'express'
import {
  GovukFrontendBackLink,
  GovukFrontendButton,
  GovukFrontendRadios,
  GovukFrontendRadiosItem,
} from '@govuk-frontend'
import { IcsFeedbackAttendanceBffDto, IcsFeedbackSubmission } from '@community-support-api'
import PresenterBase from '../../presenter/presenterBase'
import { ErrorMiddlewareErrors } from '../../@types/express'

import { GlobalContent } from '../../../assets/content/GlobalContent'
import { GovukFrontendRadiosWithConditional } from '../../@types/govukFrontend/derived'

export interface DidAttendViewModel {
  radioArgs: GovukFrontendRadiosWithConditional
  buttonArgs: GovukFrontendButton
  backLink: GovukFrontendBackLink
}

export type DidAttendContent = GlobalContent['/ics-feedback/:id/did-attend']
type SubmissionRecord = IcsFeedbackSubmission['record']
export type RecordSessionAttendanceSessionData = Partial<Pick<SubmissionRecord, 'didPersonAttend'>>

export default class DidAttendPresenter extends PresenterBase<DidAttendViewModel> {
  private errors: ErrorMiddlewareErrors

  constructor(
    private readonly caseRefId: string,
    private readonly data: IcsFeedbackAttendanceBffDto,
    private readonly record: RecordSessionAttendanceSessionData,
  ) {
    super()
  }

  private radioArgs(content: DidAttendContent): GovukFrontendRadios {
    const { id, heading, yesLabel, noLabel } = content.attendanceForm.didAttendRadios
    const { didPersonAttend } = this.record
    const items: GovukFrontendRadiosItem[] = [
      {
        id: `${id}-${yesLabel}`,
        value: yesLabel,
        text: yesLabel,
        checked: didPersonAttend === true,
      },
      {
        id: `${id}-${noLabel}`,
        value: noLabel,
        text: noLabel,
        checked: didPersonAttend === false,
      },
    ]
    return {
      name: id,
      items,
      classes: 'govuk-radios--inline',
      fieldset: {
        attributes: { 'data-testid': `fieldset-${id}` },
        legend: {
          text: heading.replace('{{ firstname }}', this.data.referralFirstName),
          isPageHeading: true,
          classes: 'govuk-fieldset__legend--l',
        },
      },
      errorMessage: this.errors.messages[id],
      attributes: { 'data-testid': id },
    }
  }

  buildViewModel(res: Response): DidAttendViewModel {
    const content = this.buildStaticContent()['/ics-feedback/:id/did-attend']
    this.errors = res.locals.errors
    return {
      backLink: { href: content.backLink.replace('{{ id }}', this.caseRefId) },
      buttonArgs: {
        text: content.attendanceForm.submitButtonText,
      },
      radioArgs: this.radioArgs(content),
    }
  }

  getTemplatePath(): string {
    return 'appointment/didAttend'
  }
}
