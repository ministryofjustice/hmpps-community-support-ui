import { Response } from 'express'
import {
  GovukFrontendBackLink,
  GovukFrontendButton,
  GovukFrontendRadios,
  GovukFrontendRadiosItem,
  GovukFrontendSummaryList,
} from '@govuk-frontend'
import { IcsFeedbackAttendanceBffDto, IcsFeedbackSubmission } from '@community-support-api'
import PresenterBase from '../../presenter/presenterBase'
import { GovukFrontendRadiosWithConditional } from '../../@types/govukFrontend/derived'
import { ErrorMiddlewareErrors } from '../../@types/express'
import buildAppointmentDetails from './AppointmentDetailsModel'
import { GlobalContent } from '../../../assets/content/GlobalContent'

type SubmissionRecord = IcsFeedbackSubmission['record']
export type RecordSessionAttendanceSessionData = Partial<Pick<SubmissionRecord, 'didSessionHappen'>>

export interface RecordSessionAttendanceViewModel {
  pageHeader: string
  description: string
  appointment: GovukFrontendSummaryList
  radioArgs: GovukFrontendRadiosWithConditional
  buttonArgs: GovukFrontendButton
  backLink: GovukFrontendBackLink
  submitHref: string
}

export type RecordSessionAttendanceContent = GlobalContent['/ics-feedback/:id/attendance']

export default class RecordSessionAttendancePresenter extends PresenterBase<
  RecordSessionAttendanceViewModel,
  RecordSessionAttendanceContent
> {
  private errors: ErrorMiddlewareErrors

  constructor(
    private readonly caseRefId: string,
    private readonly data: IcsFeedbackAttendanceBffDto,
    private readonly record: RecordSessionAttendanceSessionData,
  ) {
    super()
  }

  private radioArgs(content: RecordSessionAttendanceContent): GovukFrontendRadios {
    const { id, heading, hint, yesLabel, noLabel } = content.attendanceForm.happenedRadios
    const { didSessionHappen } = this.record
    const items: GovukFrontendRadiosItem[] = [
      {
        id: `${id}-${yesLabel}`,
        value: yesLabel,
        text: yesLabel,
        checked: didSessionHappen === true,
      },
      {
        id: `${id}-${noLabel}`,
        value: noLabel,
        text: noLabel,
        checked: didSessionHappen === false,
      },
    ]
    return {
      name: id,
      hint: hint ? { text: hint } : undefined,
      items,
      classes: 'govuk-radios--inline',
      fieldset: {
        attributes: { 'data-testid': `fieldset-${id}` },
        legend: {
          text: heading.replace('{{ firstname }}', this.data.referralFirstName),
          classes: 'govuk-fieldset__legend--m',
        },
      },
      errorMessage: this.errors.messages[id],
      attributes: { 'data-testid': id },
    }
  }

  buildViewModel(res: Response): RecordSessionAttendanceViewModel {
    const content = this.buildStaticContent(res)
    this.errors = res.locals.errors
    const appointment = {
      referralFirstName: this.data.referralFirstName,
      appointmentDate: this.data.date,
      appointmentTime: this.data.time,
    }
    return {
      backLink: { href: content.backLink.replace('{{ id }}', this.caseRefId) },
      pageHeader: content.pageHeader,
      description: content.description,
      appointment: buildAppointmentDetails(content.appointmentDetails, appointment),
      submitHref: `/ics-feedback/${this.caseRefId}/attendance`,
      buttonArgs: {
        text: content.attendanceForm.submitButtonText,
      },
      radioArgs: this.radioArgs(content),
    }
  }

  getTemplatePath(): string {
    return 'appointment/recordSessionAttendance'
  }
}
