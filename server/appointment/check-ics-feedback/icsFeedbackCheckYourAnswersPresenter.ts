import { Response } from 'express'
import { IcsFeedbackSubmission } from '@community-support-api'
import PresenterBase from '../../presenter/presenterBase'
import {
  IcsFeedbackCheckYourAnswersContent,
  IcsFeedbackCheckYourAnswersViewModel,
} from './icsFeedbsckCheckYourAnswersViewModel'

export default class IcsFeedbackCheckYourAnswersPresenter extends PresenterBase<
  IcsFeedbackCheckYourAnswersViewModel,
  IcsFeedbackCheckYourAnswersContent
> {
  constructor(private readonly icsFeedbackSubmission: IcsFeedbackSubmission) {
    super()
  }

  protected buildPageContent(res: Response) {
    return {} as IcsFeedbackCheckYourAnswersViewModel
  }

  protected getTemplatePath(): string {
    return 'appointment/icsFeedbackCheck'
  }

  renderPage(res: Response): void {
    res.render(this.getTemplatePath(), this.buildPageContent(res))
  }
}
