import { Response } from 'express'
import { GovukFrontendPanel } from '@govuk-frontend'
import PresenterBase from '../../presenter/presenterBase'
import ViewUtils from '../../utils/viewUtils'
import { WithdrawalSuccessContent, WithdrawalSuccessViewModel } from './withdrawalSuccessViewModel'

export default class WithdrawalSuccessPresenter extends PresenterBase<
  WithdrawalSuccessViewModel,
  WithdrawalSuccessContent
> {
  constructor() {
    super()
  }

  protected buildViewModel(res: Response): WithdrawalSuccessViewModel {
    const content = this.buildStaticContent(res)
    return {
      pageHeader: content.pageHeader,
      introText: content.introText,
      backToCasesLink: content.backToCasesLink,
      backToCasesLinkText: content.backToCasesLinkText,
      panel: this.buildPanel(content.pageHeader, content.introText),
    }
  }

  protected getTemplatePath(): string {
    return 'referral/withdrawal/success'
  }

  renderPage(res: Response): void {
    return res.render(this.getTemplatePath(), this.buildViewModel(res))
  }

  private buildPanel(pageHeader: string, introText: string): GovukFrontendPanel {
    return {
      titleText: pageHeader,
      html: ViewUtils.escape(introText),
    }
  }
}
