import { Response } from 'express'
import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendSummaryList } from '@govuk-frontend'
import { AppointmentIcsResponse } from '@community-support-api'
import { isPast } from 'date-fns'
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
  raidos?: RadiosContent
}

interface RadiosContent {
  heading: string
  hint: string
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

export interface TempBackendData {
  placeholder: string
}

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

  buildAppointmentDetails(content: ApointmentDetailsContent): GovukFrontendSummaryList {
    return {
      rows: [
        govFrontendSummaryListRow(content.dateLabel, dateFormat(new Date(this.data.appointmentDate))),
        govFrontendSummaryListRow(content.startTimeLabel, timeFormat(this.data.appointmentTime)),
      ],
      attributes: { 'data-testid': 'appointment-details' },
    }
  }

  buildItem({ label, raidos }: FormOptionContent): GovukFrontendRadiosItemWithConditional {
    if (raidos) {
      return { value: label, text: label, conditional: { html: '<p>testing</p>' } }
    }
    return { value: label, text: label, conditional: { html: '<p>testing</p>' } }
  }

  buildRadios({ heading, hint, options }: RadiosContent): GovukFrontendRadiosWithConditional {
    return {
      name: 'attended',
      hint: { text: hint },
      items: options.map(option => this.buildItem(option)),
      fieldset: {
        legend: {
          text: heading,
          classes: 'govuk-fieldset__legend--m',
        },
      },
      attributes: { 'data-testid': 'attended' },
    }
  }

  buildForm(content: FormContent): RecordSessionAttendanceFormViewModel | undefined {
    return {
      radios: this.buildRadios(content.radios),
      button: {
        text: content.submitButtonText,
        // attributes: { 'data-testid': 'submit' }
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
