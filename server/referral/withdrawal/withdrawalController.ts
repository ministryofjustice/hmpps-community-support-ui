import { Request, Response } from 'express'
import ReferralService from '../../services/referralService'
import WithdrawalService from '../../services/withdrawalService'
import { validateRequestBodyAgainstSchema } from '../../validation/validationUtils'
import WithdrawalConfirmationPresenter from './WithdrawalConfirmationPresenter'
import WithdrawalReasonPresenter from './WithdrawalReasonPresenter'
import { additionalInformationField, createWithdrawalFormDataSchema } from './WithdrawalFormData'

export default class WithdrawalController {
  constructor(
    private readonly referralService: ReferralService,
    private readonly withdrawalService: WithdrawalService,
  ) {}

  private async getReferralName(referralIdentifier: string, username: string): Promise<string> {
    const referral = await this.referralService.getCaseDetailsByCaseIdentifier(referralIdentifier, username)
    return referral.personDetailsTableData.name
  }

  async showReason(req: Request, res: Response): Promise<void> {
    const { referralIdentifier } = req.params as { referralIdentifier: string }
    const [referralName, withdrawalReasonResponse] = await Promise.all([
      this.getReferralName(referralIdentifier, res.locals.user.username),
      this.referralService.getWithdrawalReasons(res.locals.user.username),
    ])
    const flashedFormData = JSON.parse(req.flash('value').at(0) || '{}')
    const withdrawalReason =
      typeof flashedFormData.withdrawalReason === 'string' ? flashedFormData.withdrawalReason : undefined
    const withdrawal = withdrawalReason
      ? {
          withdrawalReason,
          additionalInformation: flashedFormData[additionalInformationField(withdrawalReason)],
        }
      : this.withdrawalService.getWithdrawal(referralIdentifier, req.session.withdrawalReferrals)
    new WithdrawalReasonPresenter(
      referralIdentifier,
      referralName,
      withdrawalReasonResponse.withdrawalReasons,
      withdrawal,
      res.locals.errors,
    ).renderPage(res)
  }

  async submitReason(req: Request, res: Response): Promise<void> {
    const { referralIdentifier } = req.params as { referralIdentifier: string }
    const withdrawalReasonResponse = await this.referralService.getWithdrawalReasons(res.locals.user.username)
    const availableWithdrawalReasons = Object.values(withdrawalReasonResponse.withdrawalReasons).flat()

    return validateRequestBodyAgainstSchema(
      createWithdrawalFormDataSchema(availableWithdrawalReasons),
      req,
      res,
      formData => {
        req.session.withdrawalReferrals = this.withdrawalService.saveWithdrawal(
          referralIdentifier,
          formData,
          req.session.withdrawalReferrals,
        )
        res.redirect(`/referral/${referralIdentifier}/withdraw/confirm`)
      },
    )
  }

  async showConfirmation(req: Request, res: Response): Promise<void> {
    const { referralIdentifier } = req.params as { referralIdentifier: string }
    const withdrawal = this.withdrawalService.getWithdrawal(referralIdentifier, req.session.withdrawalReferrals)
    if (!withdrawal) {
      res.redirect(`/referral/${referralIdentifier}/withdraw`)
      return
    }
    const referralName = await this.getReferralName(referralIdentifier, res.locals.user.username)
    new WithdrawalConfirmationPresenter(referralIdentifier, referralName, withdrawal).renderPage(res)
  }

  async submitConfirmation(req: Request, res: Response): Promise<void> {
    const { referralIdentifier } = req.params as { referralIdentifier: string }
    const withdrawal = this.withdrawalService.getWithdrawal(referralIdentifier, req.session.withdrawalReferrals)
    if (!withdrawal) {
      res.redirect(`/referral/${referralIdentifier}/withdraw`)
      return
    }

    await this.referralService.withdrawReferral(
      referralIdentifier,
      {
        reasonCode: withdrawal.withdrawalReason,
        additionalDetails: withdrawal.additionalInformation,
      },
      res.locals.user.username,
    )

    req.session.withdrawalReferrals = this.withdrawalService.removeWithdrawal(
      referralIdentifier,
      req.session.withdrawalReferrals,
    )
    res.redirect('/cases-in-progress')
  }
}
