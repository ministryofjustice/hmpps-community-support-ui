import { Response } from 'express'
import PresenterBase from '../../presenter/presenterBase'
import { WithdrawalServiceErrorContent, WithdrawalServiceErrorViewModel } from './withdrawalServiceErrorViewModel'

export default class WithdrawalServiceErrorPresenter extends PresenterBase<
  WithdrawalServiceErrorViewModel,
  WithdrawalServiceErrorContent
> {
  constructor() {
    super()
  }

  protected buildViewModel(res: Response): WithdrawalServiceErrorViewModel {
    const content = this.buildStaticContent(res)
    return {
      pageHeader: content.pageHeader,
      message: content.message,
      backToCasesLink: content.backToCasesLink,
      backToCasesLinkText: content.backToCasesLinkText,
    }
  }

  protected getTemplatePath(): string {
    return 'referral/withdrawal/serviceError'
  }

  renderPage(res: Response): void {
    return res.render(this.getTemplatePath(), this.buildViewModel(res))
  }
}
