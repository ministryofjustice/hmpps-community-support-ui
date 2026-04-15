import { Response } from 'express'
import {
  GovukFrontendBackLink,
  GovukFrontendButton,
  GovukFrontendRadios,
  GovukFrontendRadiosItem,
  GovukFrontendSummaryList,
} from '@govuk-frontend'
import { AppointmentIcsResponse } from '@community-support-api'
import PresenterBase from '../../presenter/presenterBase'
import { govFrontendSummaryListRow } from '../../utils/viewUtils'
import dateFormat from '../../utils/dateFormat'
import timeFormat from '../../utils/timeFormat'

type GovukFrontendRadiosItemWithConditional = GovukFrontendRadiosItem & {
  conditional?: { html: string }
}

export interface RecordSessionAttendanceFormViewModel {
  radios: GovukFrontendRadios
  button: GovukFrontendButton
}

export interface RecordSessionAttendanceViewModel {
  pageHeader: string
  description: string
  appointment: GovukFrontendSummaryList
  form: RecordSessionAttendanceFormViewModel
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
  constructor(private readonly data: AppointmentIcsResponse) {
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
    return { value: label, text: label }
  }

  buildRadios({ heading, hint, options }: RadiosContent): GovukFrontendRadios {
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

  buildForm(content: FormContent): RecordSessionAttendanceFormViewModel {
    return {
      radios: this.buildRadios(content.radios),
      button: { text: content.submitButtonText },
    }
  }

  buildPageContent(res: Response): RecordSessionAttendanceViewModel {
    const content = this.buildStaticContent(res)
    console.log('---content---\n', JSON.stringify(content, null, 2))
    const value = {
      backLink: { href: '#' },
      pageHeader: content.pageHeader,
      description: content.description,
      appointment: this.buildAppointmentDetails(content.appointmentDetails),
      form: this.buildForm(content.form),
      submitHref: '#',
    }
    console.log(JSON.stringify(value, null, 2))
    return value
  }

  getTemplatePath(): string {
    return 'appointment/recordSessionAttendance'
  }
}
