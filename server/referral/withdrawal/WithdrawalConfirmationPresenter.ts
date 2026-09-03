import { Response } from 'express'
import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendRadios } from '@govuk-frontend'
import { ErrorMiddlewareErrors } from '../../@types/express'
import PresenterBase from '../../presenter/presenterBase'

interface WithdrawalConfirmationContent {
  pageHeader: string
  question: string
  yesText: string
  noText: string
  continueButtonText: string
}

interface WithdrawalConfirmationViewModel {
  pageHeader: string
  confirmationRadios: GovukFrontendRadios
  continueButton: GovukFrontendButton
  submitHref: string
  backLink: GovukFrontendBackLink
}

export default class WithdrawalConfirmationPresenter extends PresenterBase<
  WithdrawalConfirmationViewModel,
  WithdrawalConfirmationContent
> {
  constructor(
    private readonly referralIdentifier: string,
    private readonly referralName: string,
    private readonly validationErrors?: ErrorMiddlewareErrors,
  ) {
    super()
  }

  protected buildViewModel(res: Response): WithdrawalConfirmationViewModel {
    const content = this.buildStaticContent(res)
    return {
      pageHeader: content.pageHeader.replace('{{ name }}', this.referralName),
      confirmationRadios: {
        name: 'confirmWithdrawal',
        fieldset: { legend: { text: content.question, classes: 'govuk-fieldset__legend--m' } },
        errorMessage: this.validationErrors?.messages.confirmWithdrawal,
        items: [
          { value: 'yes', text: content.yesText },
          { value: 'no', text: content.noText },
        ],
      },
      continueButton: { text: content.continueButtonText },
      submitHref: `/referral/${this.referralIdentifier}/withdraw/confirmation`,
      backLink: { href: `/referral/${this.referralIdentifier}/withdraw` },
    }
  }

  protected getTemplatePath(): string {
    return 'referral/withdrawal/confirmation'
  }
}
