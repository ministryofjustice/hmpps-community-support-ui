import { Request, Response } from 'express'
import ReferralService from '../../services/referralService'
import WithdrawalService from '../../services/withdrawalService'
import { validateRequestBodyAgainstSchema } from '../../validation/validationUtils'
import WithdrawalConfirmationPresenter from './WithdrawalConfirmationPresenter'
import WithdrawalReasonPresenter from './WithdrawalReasonPresenter'
import {
  additionalInformationField,
  WithdrawalConfirmationSchema,
  WithdrawalFormDataSchema,
  WithdrawalReason,
} from './WithdrawalFormData'

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
    const referralName = await this.getReferralName(referralIdentifier, res.locals.user.username)
    const flashedFormData = JSON.parse(req.flash('value').at(0) || '{}')
    const withdrawalReason = flashedFormData.withdrawalReason as WithdrawalReason | undefined
    const withdrawal = withdrawalReason
      ? {
          withdrawalReason,
          additionalInformation: flashedFormData[additionalInformationField(withdrawalReason)],
        }
      : this.withdrawalService.getWithdrawal(referralIdentifier, req.session.withdrawalReferrals)
    new WithdrawalReasonPresenter(referralIdentifier, referralName, withdrawal, res.locals.errors).renderPage(res)
  }

  submitReason(req: Request, res: Response): Promise<void> {
    const { referralIdentifier } = req.params as { referralIdentifier: string }
    return validateRequestBodyAgainstSchema(WithdrawalFormDataSchema, req, res, formData => {
      req.session.withdrawalReferrals = this.withdrawalService.saveWithdrawal(
        referralIdentifier,
        formData,
        req.session.withdrawalReferrals,
      )
      res.redirect(`/referral/${referralIdentifier}/withdraw/confirmation`)
    })
  }

  async showConfirmation(req: Request, res: Response): Promise<void> {
    const { referralIdentifier } = req.params as { referralIdentifier: string }
    const withdrawal = this.withdrawalService.getWithdrawal(referralIdentifier, req.session.withdrawalReferrals)
    if (!withdrawal) {
      res.redirect(`/referral/${referralIdentifier}/withdraw`)
      return
    }
    const referralName = await this.getReferralName(referralIdentifier, res.locals.user.username)
    new WithdrawalConfirmationPresenter(referralIdentifier, referralName, res.locals.errors).renderPage(res)
  }

  submitConfirmation(req: Request, res: Response): Promise<void> {
    const { referralIdentifier } = req.params as { referralIdentifier: string }
    if (!this.withdrawalService.getWithdrawal(referralIdentifier, req.session.withdrawalReferrals)) {
      res.redirect(`/referral/${referralIdentifier}/withdraw`)
      return Promise.resolve()
    }
    return validateRequestBodyAgainstSchema(WithdrawalConfirmationSchema, req, res, ({ confirmWithdrawal }) => {
      res.redirect(confirmWithdrawal === 'yes' ? '/cases-in-progress' : `/referral-details/${referralIdentifier}`)
    })
  }
}
