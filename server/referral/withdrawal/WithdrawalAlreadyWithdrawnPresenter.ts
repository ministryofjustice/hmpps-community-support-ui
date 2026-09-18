import { Response } from 'express'
import PresenterBase from '../../presenter/presenterBase'
import {
  WithdrawalAlreadyWithdrawnContent,
  WithdrawalAlreadyWithdrawnViewModel,
} from './withdrawalAlreadyWithdrawnViewModel'

export default class WithdrawalAlreadyWithdrawnPresenter extends PresenterBase<
  WithdrawalAlreadyWithdrawnViewModel,
  WithdrawalAlreadyWithdrawnContent
> {
  constructor() {
    super()
  }

  protected buildViewModel(res: Response): WithdrawalAlreadyWithdrawnViewModel {
    const content = this.buildStaticContent(res)
    return {
      pageHeader: content.pageHeader,
      errorMessage: content.errorMessage,
      backToCasesLink: content.backToCasesLink,
      backToCasesLinkText: content.backToCasesLinkText,
    }
  }

  protected getTemplatePath(): string {
    return 'referral/withdrawal/error'
  }

  renderPage(res: Response): void {
    return res.render(this.getTemplatePath(), this.buildViewModel(res))
  }
}
