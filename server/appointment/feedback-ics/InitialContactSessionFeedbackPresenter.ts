import { Response } from 'express'
import { GovukFrontendButton, GovukFrontendRadios, GovukFrontendSummaryList } from '@govuk-frontend'
import PresenterBase from '../../presenter/presenterBase'

export interface InitialContactSessionFeedbackViewModel {
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

export interface InitialContactSessionFeedbackViewModelContent {
  pageHeader: string
  text: string
  details: DetailsContent
  form: FormContent
  button: string
}

export interface TempBackendData {
  placeholder: string
}

export default class InitialContactSessionFeedbackPresenter extends PresenterBase<
  InitialContactSessionFeedbackViewModel | null,
  InitialContactSessionFeedbackViewModelContent
> {
  constructor(private readonly data: TempBackendData) {
    super()
  }

  buildPageContent(res: Response): InitialContactSessionFeedbackViewModel {
    return null
  }

  getTemplatePath(): string {
    return 'appointment/initialContactSessionFeedback'
  }
}
