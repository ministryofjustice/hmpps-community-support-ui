import { Response } from 'express'
import {
  GovukFrontendBackLink,
  GovukFrontendButton,
  GovukFrontendErrorSummary,
  GovukFrontendSummaryList,
} from '@govuk-frontend'
import { AppointmentIcsResponse } from '@community-support-api'
import { isPast } from 'date-fns'
import nunjucks from 'nunjucks'
import PresenterBase from '../../presenter/presenterBase'
import { govFrontendSummaryListRow } from '../../utils/viewUtils'
import dateFormat from '../../utils/dateFormat'
import timeFormat from '../../utils/timeFormat'
import getAppointmentDateTime from '../../utils/getAppointmentDateTime'
import {
  GovukFrontendRadiosItemWithConditional,
  GovukFrontendRadiosWithConditional,
} from '../../@types/govukFrontend/derived'

export interface RecordSessionAttendanceFormViewModel {
  radios: GovukFrontendRadiosWithConditional
  button: GovukFrontendButton
}

export interface RecordSessionAttendanceViewModel {
  errorSummary?: GovukFrontendErrorSummary
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

interface FormOptionContent {
  label: string
  radios?: RadiosContent
}

interface RadiosContent {
  id: string
  heading: string
  hint?: string
  error: string
  options: FormOptionContent[]
}

interface FormContent {
  radios: RadiosContent
  submitButtonText: string
}

export interface RecordSessionAttendanceContent {
  pageHeader: string
  description: string
  appointmentDetails: ApointmentDetailsContent
  attendanceForm: FormContent
}

const condiditionalTemplate =
  `{% from "govuk/components/radios/macro.njk" import govukRadios %}{{ govukRadios(content.radios) }}` as const

const gatherErrors = ({ id, options, error }: RadiosContent): Record<string, string> => {
  const children = options
    .map(option => option.radios)
    .filter(radios => !!radios)
    .map(radios => gatherErrors)
    .reduce<Record<string, string>>((acc, child) => ({ ...acc, ...child }), {})
  const result = { ...children }
  result[id] = error
  return result
}

export default class RecordSessionAttendancePresenter extends PresenterBase<
  RecordSessionAttendanceViewModel,
  RecordSessionAttendanceContent
> {
  private readonly errors: string[]

  constructor(
    private readonly caseRefId: string,
    private readonly data: AppointmentIcsResponse,
    error: string | string[] = [],
  ) {
    super()
    if (typeof error === 'string') {
      this.errors = [error]
    } else {
      this.errors = error
    }
  }

  private buildAppointmentDetails(content: ApointmentDetailsContent): GovukFrontendSummaryList {
    return {
      rows: [
        govFrontendSummaryListRow(content.dateLabel, dateFormat(new Date(this.data.appointmentDate))),
        govFrontendSummaryListRow(content.startTimeLabel, timeFormat(this.data.appointmentTime)),
      ],
      attributes: { 'data-testid': 'appointment-details' },
    }
  }

  private buildConditional(content: RadiosContent): string {
    const radios = this.buildRadios(content)
    return nunjucks.renderString(condiditionalTemplate, { content: { radios } })
  }

  private buildItem(name: string, { label, radios }: FormOptionContent): GovukFrontendRadiosItemWithConditional {
    return {
      id: `${name}-${label}`,
      value: label,
      text: label,
      conditional: radios ? { html: this.buildConditional(radios) } : undefined,
    }
  }

  private buildRadios({ id, heading, hint, options, error }: RadiosContent): GovukFrontendRadiosWithConditional {
    return {
      name: id,
      hint: hint ? { text: hint } : undefined,
      items: options.map(option => this.buildItem(id, option)),
      fieldset: {
        attributes: { 'data-testid': `fieldset-${id}` },
        legend: {
          text: nunjucks.renderString(heading, { firstname: this.data.referralFirstName }),
          classes: 'govuk-fieldset__legend--m',
        },
      },
      errorMessage: this.errors.includes(id)
        ? {
            text: error,
          }
        : null,
      attributes: { 'data-testid': id },
    }
  }

  private buildForm(content: FormContent): RecordSessionAttendanceFormViewModel | undefined {
    return {
      radios: this.buildRadios(content.radios),
      button: {
        text: content.submitButtonText,
      },
    }
  }

  private buildErrorSummary(errorLookup: Record<string, string>): GovukFrontendErrorSummary | undefined {
    if (this.errors.length === 0) {
      return undefined
    }
    return {
      titleText: 'There is a problem',
      errorList: this.errors.map(error => ({ text: errorLookup[error] })),
      attributes: {
        'data-testid': 'error-messages',
      },
    }
  }

  buildPageContent(res: Response): RecordSessionAttendanceViewModel {
    const content = this.buildStaticContent(res)
    const errorLookup = gatherErrors(content.attendanceForm.radios)
    return {
      errorSummary: this.buildErrorSummary(errorLookup),
      backLink: { href: '#' },
      pageHeader: content.pageHeader,
      description: content.description,
      appointment: this.buildAppointmentDetails(content.appointmentDetails),
      form: isPast(getAppointmentDateTime(this.data)) ? this.buildForm(content.attendanceForm) : undefined,
      submitHref: `/ics-feedback/attendance/${this.caseRefId}`,
    }
  }

  getTemplatePath(): string {
    return 'appointment/recordSessionAttendance'
  }
}
