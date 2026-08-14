import { Referral } from '@community-support-api'
import { Response } from 'express'
import { GovukFrontendPanel } from '@govuk-frontend'
import PresenterBase from '../../presenter/presenterBase'
import { ReferralConfirmationContent, ReferralConfirmationViewModel } from './confirmationViewModel'
import ViewUtils from '../../utils/viewUtils'

export default class ConfirmationPresenter extends PresenterBase<
  ReferralConfirmationViewModel,
  ReferralConfirmationContent
> {
  constructor(private readonly referral: Referral) {
    super()
  }

  buildViewModel(res: Response): ReferralConfirmationViewModel {
    const content = this.buildStaticContent(res)
    const viewModel = {} as ReferralConfirmationViewModel
    viewModel.staticContent = content
    viewModel.startNewReferralLink = content.startNewReferralLink
    viewModel.startNewReferralButtonText = content.startNewReferralButtonText
    viewModel.backToCommunityHomeLink = content.backToCommunityHomeLink
    viewModel.backToCommunityHomeLinkText = content.backToCommunityHomeLinkText
    viewModel.panel = this.buildPanel(content.pageHeader, content.referenceNumberIntro, this.referral.referenceNumber)
    return viewModel
  }

  getTemplatePath(): string {
    return 'referral/confirmation'
  }

  private buildPanel(pageHeader: string, referenceNumberIntro: string, referenceNumber: string): GovukFrontendPanel {
    return {
      titleText: pageHeader,
      html: `${ViewUtils.escape(referenceNumberIntro)}<br><strong>${ViewUtils.escape(referenceNumber)}</strong>`,
    }
  }

  renderPage(res: Response): void {
    return res.render(this.getTemplatePath(), this.buildViewModel(res))
  }
}
