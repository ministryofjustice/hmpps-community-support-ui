import { Response } from 'express'
import PresenterBase from '../../presenter/presenterBase'
import { WithdrawalFormData } from './WithdrawalFormData'
import { WithdrawalConfirmContent, WithdrawalConfirmViewModel } from './withdrawalConfirmViewModel'

const toWithdrawalReasonLabel = (reason: string): string => {
  if (!reason.includes('_')) {
    return reason
  }

  return reason
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default class WithdrawalConfirmPresenter extends PresenterBase<
  WithdrawalConfirmViewModel,
  WithdrawalConfirmContent
> {
  constructor(
    private readonly caseIdentifier: string,
    private readonly referralName: string,
    private readonly withdrawal: WithdrawalFormData,
  ) {
    super()
  }

  protected buildViewModel(res: Response): WithdrawalConfirmViewModel {
    const content = this.buildStaticContent(res)
    return {
      pageHeader: content.pageHeader,
      reasonSummary: {
        rows: [
          {
            key: {
              text: content.questionLabel.replace('{{ name }}', this.referralName),
            },
            value: {
              text: toWithdrawalReasonLabel(this.withdrawal.withdrawalReason),
            },
            actions: {
              items: [
                {
                  href: `/referral/${this.caseIdentifier}/withdraw`,
                  text: content.changeLinkText,
                  visuallyHiddenText: 'withdrawal reason',
                },
              ],
            },
          },
        ],
      },
      warningText: content.warningText,
      withdrawButton: { text: content.withdrawButtonText, classes: 'govuk-button--warning' },
      cancelHref: `/referral-details/${this.caseIdentifier}`,
      cancelLinkText: content.cancelLinkText,
      submitHref: `/referral/${this.caseIdentifier}/withdraw/confirm`,
      backLink: { href: `/referral/${this.caseIdentifier}/withdraw` },
    }
  }

  protected getTemplatePath(): string {
    return 'referral/withdrawal/confirm'
  }
}
