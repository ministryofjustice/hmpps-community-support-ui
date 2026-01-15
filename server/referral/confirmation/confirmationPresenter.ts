import { Referral } from '@community-support-api'
import { Response, Request, NextFunction } from 'express'
import { GovukFrontendPanel } from '@govuk-frontend'
import PresenterBase from '../../presenter/presenterBase'
import { ReferralConfirmationViewModel } from './confirmationViewModel'
import ViewUtils from '../../utils/viewUtils'

export default class ConfirmationPresenter extends PresenterBase<ReferralConfirmationViewModel> {
  constructor(
    staticContent: Record<string, string>,
    private readonly referral: Referral,
  ) {
    super(staticContent)
  }

  buildPageContent(): ReferralConfirmationViewModel {
    const viewModel = {} as ReferralConfirmationViewModel
    viewModel.title = 'The referral has been sent'
    viewModel.referenceNumberIntro = `Your reference number`
    viewModel.referenceNumber = this.referral.referenceNumber
    viewModel.startAReferralLink = `/referral/new/select-a-service?personDetailsId=${this.referral.crn}`
    viewModel.panel = this.buildPanel(viewModel.title, viewModel.referenceNumberIntro, viewModel.referenceNumber)
    return viewModel
  }

  getTemplatePath(): string {
    return 'referral/confirmation'
  }

  buildPanel(title: string, referenceNumberIntro: string, referenceNumber: string): GovukFrontendPanel {
    return {
      titleText: title,
      html: `${ViewUtils.escape(referenceNumberIntro)}<br><strong>${ViewUtils.escape(referenceNumber)}</strong>`,
    }
  }

  renderPage(res: Response, req: Request, next: NextFunction): void {
    return res.render(this.getTemplatePath(), {
      content: this.buildPageContent(),
    })
  }
}
