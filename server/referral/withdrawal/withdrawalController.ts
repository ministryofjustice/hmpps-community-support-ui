import { Request, Response } from 'express'
import ReferralService from '../../services/referralService'
import WithdrawalService from '../../services/withdrawalService'
import type { ReferralDetailsNotification } from '../referralDetails/ReferralDetailsNotification'
import { validateRequestBodyAgainstSchema } from '../../validation/validationUtils'
import WithdrawalConfirmPresenter from './WithdrawalConfirmPresenter'
import WithdrawalReasonPresenter from './WithdrawalReasonPresenter'
import WithdrawalServiceErrorPresenter from './WithdrawalServiceErrorPresenter'
import { additionalInformationField, createWithdrawalFormDataSchema, WithdrawalReason } from './WithdrawalFormData'

const getResponseStatus = (error: unknown): number | undefined => {
  if (typeof error !== 'object' || error === null || !('responseStatus' in error)) {
    return undefined
  }

  const { responseStatus } = error as { responseStatus?: unknown }
  return typeof responseStatus === 'number' ? responseStatus : undefined
}

export default class WithdrawalController {
  constructor(
    private readonly referralService: ReferralService,
    private readonly withdrawalService: WithdrawalService,
  ) {}

  private async getReferralName(caseIdentifier: string, username: string): Promise<string> {
    const referral = await this.referralService.getCaseDetailsByCaseIdentifier(caseIdentifier, username)
    return referral.personDetailsTableData.name
  }

  async showReason(req: Request, res: Response): Promise<void> {
    const { caseIdentifier } = req.params as { caseIdentifier: string }
    const { username } = res.locals.user
    const [referralName, { withdrawalReasons }] = await Promise.all([
      this.getReferralName(caseIdentifier, username),
      this.referralService.getWithdrawalReasons(username),
    ])
    const flashedFormData = JSON.parse(req.flash('value').at(0) || '{}')
    const withdrawalReason = flashedFormData.withdrawalReason as WithdrawalReason | undefined
    const withdrawal = withdrawalReason
      ? {
          withdrawalReason,
          additionalInformation: flashedFormData[additionalInformationField(withdrawalReason)],
        }
      : this.withdrawalService.getWithdrawal(caseIdentifier, req.session.withdrawalReferrals)

    new WithdrawalReasonPresenter(
      caseIdentifier,
      referralName,
      withdrawalReasons,
      withdrawal,
      res.locals.errors,
    ).renderPage(res)
  }

  async submitReason(req: Request, res: Response): Promise<void> {
    const { caseIdentifier } = req.params as { caseIdentifier: string }
    const withdrawalReasonResponse = await this.referralService.getWithdrawalReasons(res.locals.user.username)
    const availableWithdrawalReasons = Object.values(withdrawalReasonResponse.withdrawalReasons).flat()

    return validateRequestBodyAgainstSchema(
      createWithdrawalFormDataSchema(availableWithdrawalReasons),
      req,
      res,
      formData => {
        req.session.withdrawalReferrals = this.withdrawalService.saveWithdrawal(
          caseIdentifier,
          formData,
          req.session.withdrawalReferrals,
        )
        res.redirect(`/referral/${caseIdentifier}/withdraw/confirm`)
      },
    )
  }

  async showConfirmation(req: Request, res: Response): Promise<void> {
    const { caseIdentifier } = req.params as { caseIdentifier: string }
    const withdrawal = this.withdrawalService.getWithdrawal(caseIdentifier, req.session.withdrawalReferrals)
    if (!withdrawal) {
      res.redirect(`/referral/${caseIdentifier}/withdraw`)
      return
    }

    const referralName = await this.getReferralName(caseIdentifier, res.locals.user.username)
    new WithdrawalConfirmPresenter(caseIdentifier, referralName, withdrawal).renderPage(res)
  }

  async submitConfirmation(req: Request, res: Response): Promise<void> {
    const { caseIdentifier } = req.params as { caseIdentifier: string }
    const withdrawal = this.withdrawalService.getWithdrawal(caseIdentifier, req.session.withdrawalReferrals)
    if (!withdrawal) {
      res.redirect(`/referral/${caseIdentifier}/withdraw`)
      return
    }

    try {
      await this.referralService.withdrawReferral(
        caseIdentifier,
        {
          reasonCode: withdrawal.withdrawalReason,
          additionalDetails: withdrawal.additionalInformation,
        },
        res.locals.user.username,
      )

      req.session.withdrawalReferrals = this.withdrawalService.removeWithdrawal(
        caseIdentifier,
        req.session.withdrawalReferrals,
      )
      res.redirect('/cases-in-progress')
    } catch (error) {
      if (getResponseStatus(error) === 409) {
        const referral = await this.referralService.getCaseDetailsByCaseIdentifier(
          caseIdentifier,
          res.locals.user.username,
        )
        req.session.referralDetailsNotification = {
          type: 'warning',
          code: 'withdrawalAlreadyCompleted',
          caseReference: caseIdentifier,
        } satisfies ReferralDetailsNotification
        res.redirect(`/referral-details/${referral.id}`)
        return
      }

      res.redirect(`/referral/${caseIdentifier}/withdraw/service-error`)
    }
  }

  async showServiceError(_req: Request, res: Response): Promise<void> {
    new WithdrawalServiceErrorPresenter().renderPage(res)
  }
}
