import { Request, Response } from 'express'
import ReferralService from '../../services/referralService'
import WithdrawalService from '../../services/withdrawalService'
import WithdrawalController from './withdrawalController'

describe('WithdrawalController', () => {
  const referralIdentifier = 'QD0878DE'
  let controller: WithdrawalController
  let req: Request
  let res: Response

  beforeEach(() => {
    controller = new WithdrawalController({} as ReferralService, new WithdrawalService())
    req = {
      params: { referralIdentifier },
      session: {
        withdrawalReferrals: {
          [referralIdentifier]: {
            withdrawalReason: 'NOT_ENGAGED',
            additionalInformation: 'No longer engaging',
          },
        },
      },
      body: {},
      flash: jest.fn(),
    } as unknown as Request
    res = { redirect: jest.fn() } as unknown as Response
  })

  it('returns to referral details when withdrawal is not confirmed', async () => {
    req.body = { confirmWithdrawal: 'no' }

    await controller.submitConfirmation(req, res)

    expect(res.redirect).toHaveBeenCalledWith(`/referral-details/${referralIdentifier}`)
  })

  // TODO - Update this to use the confirmation page once implemented
  it('returns to open cases when withdrawal is confirmed', async () => {
    req.body = { confirmWithdrawal: 'yes' }

    await controller.submitConfirmation(req, res)

    expect(res.redirect).toHaveBeenCalledWith('/cases-in-progress')
    expect(req.session.withdrawalReferrals[referralIdentifier]).toEqual({
      withdrawalReason: 'NOT_ENGAGED',
      additionalInformation: 'No longer engaging',
    })
  })

  it('guards confirmation when no reason has been saved', async () => {
    req.session.withdrawalReferrals = {}

    await controller.submitConfirmation(req, res)

    expect(res.redirect).toHaveBeenCalledWith(`/referral/${referralIdentifier}/withdraw`)
  })
})
