import { Response } from 'express'
import { GovukFrontendButton, GovukFrontendRadios, GovukFrontendSummaryList } from '@govuk-frontend'
import PresenterBase from '../../presenter/presenterBase'

export interface RecordSessionAttendanceViewModel {
  pageHeader: string
  text: string
  details: GovukFrontendSummaryList
  form: GovukFrontendRadios
  button: GovukFrontendButton
}

interface DetailsContent {
  dateLabel: string
  startTimeLabel: string
}

interface FormContent {
  heading: string
  subheading: string
  options: string[]
}

export interface RecordSessionAttendanceContent {
  pageHeader: string
  text: string
  details: DetailsContent
  form1: FormContent
  form2: FormContent
  button: string
}

export interface TempBackendData {
  placeholder: string
}

export default class RecordSessionAttendancePresenter extends PresenterBase<
  RecordSessionAttendanceViewModel | null,
  RecordSessionAttendanceContent
> {
  constructor(private readonly data: TempBackendData) {
    super()
  }

  buildPageContent(res: Response): RecordSessionAttendanceViewModel | null {
    return null
  }

  getTemplatePath(): string {
    return 'appointment/initialContactSessionFeedback'
  }
}
