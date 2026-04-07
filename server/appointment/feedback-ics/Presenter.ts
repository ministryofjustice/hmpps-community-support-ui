import { Response } from 'express'
import PresenterBase from '../../presenter/presenterBase'

export interface InitialContactSessionFeedbackViewModel {
  placeholder: string
}
export interface InitialContactSessionFeedbackViewModelContent {
  placeholder: string
}

export interface TempBackendData {
  placeholder: string
}

export default class InitialContactSessionFeedbackPresenter extends PresenterBase<
  InitialContactSessionFeedbackViewModel,
  InitialContactSessionFeedbackViewModelContent
> {
  constructor(private readonly data: TempBackendData) {
    super()
  }

  buildPageContent(res: Response): InitialContactSessionFeedbackViewModel {
    return { placeholder: 'placeholder' }
  }

  getTemplatePath(): string {
    return 'appointment/initialContactSessionFeedback'
  }
}
