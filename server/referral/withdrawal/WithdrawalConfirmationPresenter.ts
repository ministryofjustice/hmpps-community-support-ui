import { Response } from 'express'
import PresenterBase from '../../presenter/presenterBase'
import { WithdrawalFormData, WithdrawalReason } from './WithdrawalFormData'
import { WithdrawalConfirmationContent, WithdrawalConfirmationViewModel } from './withdrawalConfirmationViewModel'

const withdrawalReasonLabels: Record<WithdrawalReason, string> = {
  INELIGIBLE_REFERRAL: 'Ineligible referral',
  MISTAKEN_OR_DUPLICATE_REFERRAL: 'Mistaken or duplicate referral',
  NOT_ENGAGED: 'Not engaged',
  NEEDS_MET_THROUGH_ANOTHER_ROUTE: 'Needs met through another route',
  USER_DIED: 'User died',
  WORK_CARING_COMMITMENTS_OR_SICKNESS: 'Work, caring commitments, or sickness',
  ACQUITTED_ON_APPEAL: 'Acquitted on appeal',
  RETURNED_TO_CUSTODY: 'Returned to custody',
  SENTENCE_REVOKED: 'Sentence revoked',
  SENTENCE_EXPIRED: 'Sentence expired',
  OTHER_CHANGE_OF_CIRCUMSTANCE: 'Any other change of circumstance',
}

export default class WithdrawalConfirmationPresenter extends PresenterBase<
  WithdrawalConfirmationViewModel,
  WithdrawalConfirmationContent
> {
  constructor(
    private readonly referralIdentifier: string,
    private readonly referralName: string,
    private readonly withdrawal: WithdrawalFormData,
  ) {
    super()
  }

  protected buildViewModel(res: Response): WithdrawalConfirmationViewModel {
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
              text: withdrawalReasonLabels[this.withdrawal.withdrawalReason],
            },
            actions: {
              items: [
                {
                  href: `/referral/${this.referralIdentifier}/withdraw`,
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
      cancelHref: `/referral-details/${this.referralIdentifier}`,
      cancelLinkText: content.cancelLinkText,
      submitHref: `/referral/${this.referralIdentifier}/withdraw/confirm`,
      backLink: { href: `/referral/${this.referralIdentifier}/withdraw` },
    }
  }

  protected getTemplatePath(): string {
    return 'referral/withdrawal/confirmation'
  }
}
