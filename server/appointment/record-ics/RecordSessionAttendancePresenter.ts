import { Response } from 'express'
import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendSummaryList } from '@govuk-frontend'
import { isPast } from 'date-fns'
import { IcsFeedbackSubmission } from '@community-support-api'
import PresenterBase from '../../presenter/presenterBase'
import getAppointmentDateTime from '../../utils/getAppointmentDateTime'
import {
  ConditionalInput,
  GovukFrontendRadiosItemWithConditional,
  GovukFrontendRadiosWithConditional,
} from '../../@types/govukFrontend/derived'
import { ErrorMiddlewareErrors } from '../../@types/express'
import buildAppointmentDetails, { RecordSessionAttendancePresenterData } from './AppointmentDetailsModel'

type SubmissionRecord = IcsFeedbackSubmission['record']
export type RecordSessionAttendanceSessionData = Partial<Pick<SubmissionRecord, 'didSessionHappen' | 'didPersonAttend'>>

export interface RecordSessionAttendanceFormViewModel {
  radios: GovukFrontendRadiosWithConditional
  button: GovukFrontendButton
}

export interface RecordSessionAttendanceViewModel {
  pageHeader: string
  description: string
  appointment: GovukFrontendSummaryList
  form?: RecordSessionAttendanceFormViewModel
  backLink: GovukFrontendBackLink
  submitHref: string
}

interface ApointmentDetailsContent {
  dateLabel: string
  startTimeLabel: string
}

interface RadiosContent {
  id: string
  heading: string
  error: string
  yesLabel: string
  noLabel: string
}

type RadiosWithHintContent = RadiosContent & {
  hint: string
}

interface FormContent {
  happenedRadios: RadiosWithHintContent
  attendedRadios: RadiosContent
  submitButtonText: string
}

export interface RecordSessionAttendanceContent {
  pageHeader: string
  description: string
  appointmentDetails: ApointmentDetailsContent
  attendanceForm: FormContent
  backLink: string
}

export default class RecordSessionAttendancePresenter extends PresenterBase<
  RecordSessionAttendanceViewModel,
  RecordSessionAttendanceContent
> {
  private errors: ErrorMiddlewareErrors

  constructor(
    private readonly caseRefId: string,
    private readonly data: RecordSessionAttendancePresenterData,
    private readonly record: RecordSessionAttendanceSessionData,
  ) {
    super()
  }

  private buildAttendedRadios({ id, error, heading, yesLabel, noLabel }: RadiosContent): ConditionalInput {
    const { didPersonAttend } = this.record
    const errorText = this.errors.messages[id]
      ? error.replace('{{ firstname }}', this.data.referralFirstName)
      : undefined
    const errorHtml = errorText
      ? `
    <p id="${id}-error" class="govuk-error-message">
      <span class="govuk-visually-hidden">Error:</span> ${errorText}
    </p>`
      : ''
    const yesRadio: string = `<div class="govuk-radios__item">
      <input class="govuk-radios__input" id="${id}-${yesLabel}" name="${id}" type="radio" value="${yesLabel}" ${didPersonAttend === true ? 'checked' : ''}>
        <label class="govuk-radios__label" for="${id}-${yesLabel}">${yesLabel}</label>
      </div>`
    const noRadio: string = `<div class="govuk-radios__item">
        <input class="govuk-radios__input" id="${id}-${noLabel}" name="${id}" type="radio" value="${noLabel}" ${didPersonAttend === false ? 'checked' : ''}>
        <label class="govuk-radios__label" for="${id}-${noLabel}">${noLabel}</label>
      </div>`
    const radiosTemplate = `<div class="govuk-form-group">
  <fieldset class="govuk-fieldset" data-testid="fieldset-${id}">
    <legend class="govuk-fieldset__legend govuk-fieldset__legend--s">
      <h2 class="govuk-fieldset__heading">
        ${heading.replace('{{ firstname }}', this.data.referralFirstName)}
      </h2>
    </legend>
    ${errorHtml}
    <div class="govuk-radios" data-module="govuk-radios" data-testid="${id}">
      ${yesRadio}
      ${noRadio}
    </div>
  </fieldset>
</div>`
    return { html: radiosTemplate }
  }

  private buildHappenedRadios(content: FormContent): GovukFrontendRadiosWithConditional {
    const { id, heading, hint, yesLabel, noLabel, error } = content.happenedRadios
    const { didSessionHappen } = this.record
    const items: GovukFrontendRadiosItemWithConditional[] = [
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
        checked: didSessionHappen === false || this.errors.messages.attended, // check if attended so that attended radios is shown
        conditional: this.buildAttendedRadios(content.attendedRadios),
      },
    ]
    return {
      name: id,
      hint: hint ? { text: hint } : undefined,
      items,
      fieldset: {
        attributes: { 'data-testid': `fieldset-${id}` },
        legend: {
          text: heading.replace('{{ firstname }}', this.data.referralFirstName),
          classes: 'govuk-fieldset__legend--m',
        },
      },
      errorMessage: this.errors.messages[id]
        ? {
            text: error.replace('{{ firstname }}', this.data.referralFirstName),
            id,
          }
        : null,
      attributes: { 'data-testid': id },
    }
  }

  private buildForm(content: FormContent): RecordSessionAttendanceFormViewModel | undefined {
    return {
      radios: this.buildHappenedRadios(content),
      button: {
        text: content.submitButtonText,
      },
    }
  }

  buildPageContent(res: Response): RecordSessionAttendanceViewModel {
    const content = this.buildStaticContent(res)
    console.log('data :', this.data)
    const date = getAppointmentDateTime(this.data)
    console.log('date : ', date)
    const isPastValue = isPast(date)
    console.log('isPastValue : ', isPastValue)
    this.errors = res.locals.errors
    return {
      backLink: { href: content.backLink.replace('{{ id }}', this.caseRefId) },
      pageHeader: content.pageHeader,
      description: content.description,
      appointment: buildAppointmentDetails(content.appointmentDetails, this.data),
      form: isPast(getAppointmentDateTime(this.data)) ? this.buildForm(content.attendanceForm) : undefined,
      submitHref: `/ics-feedback/${this.caseRefId}/attendance`,
    }
  }

  getTemplatePath(): string {
    return 'appointment/recordSessionAttendance'
  }
}
