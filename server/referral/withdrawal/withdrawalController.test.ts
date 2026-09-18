import { Request, Response } from 'express'
import ReferralService from '../../services/referralService'
import WithdrawalService from '../../services/withdrawalService'
import WithdrawalController from './withdrawalController'

describe('WithdrawalController', () => {
  const referralIdentifier = 'QD0878DE'
  let controller: WithdrawalController
  let referralService: jest.Mocked<ReferralService>
  let req: Request
  let res: Response

  beforeEach(() => {
    referralService = { withdrawReferral: jest.fn() } as unknown as jest.Mocked<ReferralService>
    controller = new WithdrawalController(referralService, new WithdrawalService())
    req = {
      params: { referralIdentifier },
      session: {
        withdrawalReferrals: {
          [referralIdentifier]: {
            withdrawalReason: 'Not engaged',
            additionalInformation: 'No longer engaging',
          },
        },
      },
      body: {},
      flash: jest.fn(),
    } as unknown as Request
    res = {
      redirect: jest.fn(),
      locals: { user: { username: 'test-user' } },
    } as unknown as Response
  })

  it('submits withdrawal and returns to open cases when confirmed', async () => {
    referralService.withdrawReferral.mockResolvedValue(undefined)

    await controller.submitConfirmation(req, res)

    expect(referralService.withdrawReferral).toHaveBeenCalledWith(
      referralIdentifier,
      {
        reasonCode: 'Not engaged',
        additionalDetails: 'No longer engaging',
      },
      'test-user',
    )
    expect(res.redirect).toHaveBeenCalledWith('/cases-in-progress')
    expect(req.session.withdrawalReferrals[referralIdentifier]).toBeUndefined()
  })

  it('guards confirmation when no reason has been saved', async () => {
    req.session.withdrawalReferrals = {}

    await controller.submitConfirmation(req, res)

    expect(res.redirect).toHaveBeenCalledWith(`/referral/${referralIdentifier}/withdraw`)
    expect(referralService.withdrawReferral).not.toHaveBeenCalled()
  })
})
