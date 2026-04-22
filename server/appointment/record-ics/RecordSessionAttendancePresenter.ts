import { Response } from 'express'
import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendSummaryList } from '@govuk-frontend'
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
  heading: string
  hint?: string
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
  form: FormContent
}

const condiditionalTemplate =
  `{% from "govuk/components/radios/macro.njk" import govukRadios %}{{ govukRadios(content.radios) }}` as const

export default class RecordSessionAttendancePresenter extends PresenterBase<
  RecordSessionAttendanceViewModel,
  RecordSessionAttendanceContent
> {
  constructor(
    private readonly caseRefId: string,
    private readonly data: AppointmentIcsResponse,
  ) {
    super()
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
    const radios = this.buildRadios('happened', content)
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

  private buildRadios(name: string, { heading, hint, options }: RadiosContent): GovukFrontendRadiosWithConditional {
    return {
      name,
      hint: hint ? { text: hint } : undefined,
      items: options.map(option => this.buildItem(name, option)),
      fieldset: {
        attributes: { 'data-testid': `fieldset-${name}` },
        legend: {
          text: nunjucks.renderString(heading, { firstname: this.data.referralFirstName }),
          classes: 'govuk-fieldset__legend--m',
        },
      },
      attributes: { 'data-testid': name },
    }
  }

  private buildForm(content: FormContent, fake: number = 0): RecordSessionAttendanceFormViewModel | undefined {
    return {
      radios: this.buildRadios('attended', content.radios),
      button: {
        text: content.submitButtonText,
      },
    }
  }

  buildPageContent(res: Response): RecordSessionAttendanceViewModel {
    const content = this.buildStaticContent(res)
    return {
      backLink: { href: '#' },
      pageHeader: content.pageHeader,
      description: content.description,
      appointment: this.buildAppointmentDetails(content.appointmentDetails),
      form: isPast(getAppointmentDateTime(this.data)) ? this.buildForm(content.form) : undefined,
      submitHref: `/ics-feedback/attendance/${this.caseRefId}`,
    }
  }

  getTemplatePath(): string {
    return 'appointment/recordSessionAttendance'
  }
}
