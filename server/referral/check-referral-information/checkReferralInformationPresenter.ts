import { ReferralInformationDto } from '@community-support-api'
import { GovukFrontendSummaryList } from '@govuk-frontend'
import { Response } from 'express'
import PresenterBase from '../../presenter/presenterBase'
import { CheckReferralInformationContent, CheckReferralInformationViewModel } from './checkReferralInformationViewModel'

export default class CheckReferralInformationPresenter extends PresenterBase<CheckReferralInformationViewModel> {
  constructor(private readonly referralInformation: ReferralInformationDto) {
    super()
  }

  buildPageContent(res: Response): CheckReferralInformationViewModel {
    const viewModel = {} as CheckReferralInformationViewModel
    const content = this.buildStaticContent(res)
    viewModel.pageHeader = content.pageHeader
    viewModel.submitButtonText = content.submitButtonText
    viewModel.personalDetailsSummary = this.buildPersonalDetailsSummary()
    viewModel.referralDetailsSummary = this.buildReferralDetailsSummary()
    viewModel.submitHref = `/referral/${this.referralInformation.referralId}/submit-referral-information`
    return viewModel
  }

  buildStaticContent(res: Response): CheckReferralInformationContent {
    const { content } = res.locals
    return content as CheckReferralInformationContent
  }

  getTemplatePath(): string {
    return `referral/checkReferralInformation`
  }

  renderPage(res: Response): void {
    return res.render(this.getTemplatePath(), this.buildPageContent(res))
  }

  private buildPersonalDetailsSummary(): GovukFrontendSummaryList {
    const summary = [
      {
        key: { text: 'Name' },
        value: { text: `${this.referralInformation.firstName} ${this.referralInformation.lastName}` },
      },
      {
        key: { text: 'CRN' },
        value: { text: this.referralInformation.crn },
      },
      {
        key: { text: 'Sex' },
        value: { text: this.referralInformation.sex },
      },
    ]
    return {
      card: {
        title: {
          text: 'Personal details',
        },
      },
      rows: summary,
    }
  }

  private buildReferralDetailsSummary(): GovukFrontendSummaryList {
    const summary = [
      {
        key: { text: 'Community Support Service' },
        value: { text: this.referralInformation.communityServiceProviderName },
      },
      {
        key: { text: 'Location' },
        value: { text: this.referralInformation.region },
      },
      {
        key: { text: 'Delivery Partner' },
        value: { text: this.referralInformation.deliveryPartner },
      },
    ]
    return {
      card: {
        title: {
          text: 'Referral details',
        },
      },
      rows: summary,
    }
  }
}
