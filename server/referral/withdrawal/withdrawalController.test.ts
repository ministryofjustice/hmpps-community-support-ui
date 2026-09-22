import { Request, Response } from 'express'
import { WithdrawalReasonsGroupedBffResponseDto } from '@community-support-api'
import ReferralService from '../../services/referralService'
import WithdrawalService from '../../services/withdrawalService'
import WithdrawalController from './withdrawalController'

describe('WithdrawalController', () => {
  const caseIdentifier = 'QD0878DE'
  let controller: WithdrawalController
  let referralService: jest.Mocked<ReferralService>
  let req: Request
  let res: Response

  beforeEach(() => {
    referralService = {
      getCaseDetailsByCaseIdentifier: jest.fn().mockResolvedValue({
        personDetailsTableData: { name: 'Alex River' },
      }),
      getWithdrawalReasons: jest.fn().mockResolvedValue({
        withdrawalReasons: { 'Problem with referral': ['Ineligible referral'] },
      } satisfies WithdrawalReasonsGroupedBffResponseDto),
      withdrawReferral: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<ReferralService>
    controller = new WithdrawalController(referralService, new WithdrawalService())
    req = {
      params: { caseIdentifier },
      session: {
        withdrawalReferrals: {
          [caseIdentifier]: {
            withdrawalReason: 'Not engaged',
            additionalInformation: 'No longer engaging',
          },
        },
      },
      body: {},
      flash: jest.fn().mockReturnValue([]),
    } as unknown as Request
    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: {
        user: { username: 'user1' },
        content: {
          pageHeader: 'The referral has been withdrawn',
          introText: 'You can now return to cases in progress.',
          goToCaseListLink: '/cases-in-progress',
          goToCaseListButtonText: 'Go to case list',
        },
      },
    } as unknown as Response
  })

  describe('showReason', () => {
    it('fetches withdrawal reasons from the referral service and renders the page', async () => {
      await controller.showReason(req, res)

      expect(referralService.getWithdrawalReasons).toHaveBeenCalledWith('user1')
      expect(referralService.getCaseDetailsByCaseIdentifier).toHaveBeenCalledWith(referralIdentifier, 'user1')
      expect(res.render).toHaveBeenCalledWith(
        'referral/withdrawal/reason',
        expect.objectContaining({
          content: expect.objectContaining({
            reasonGroups: [
              expect.objectContaining({
                heading: 'Problem with referral',
                radios: expect.objectContaining({
                  items: [expect.objectContaining({ value: 'Ineligible referral', text: 'Ineligible referral' })],
                }),
              }),
            ],
          }),
        }),
      )
    })

    it('moves "Another reason" to the end of its group, after a divider, even when the API lists it first', async () => {
      referralService.getWithdrawalReasons.mockResolvedValue({
        withdrawalReasons: {
          'User related': ['Another reason', 'Died', 'Not engaged'],
        },
      } satisfies WithdrawalReasonsGroupedBffResponseDto)

      await controller.showReason(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'referral/withdrawal/reason',
        expect.objectContaining({
          content: expect.objectContaining({
            reasonGroups: [
              expect.objectContaining({
                radios: expect.objectContaining({
                  items: [
                    expect.objectContaining({ text: 'Died' }),
                    expect.objectContaining({ text: 'Not engaged' }),
                    expect.objectContaining({ divider: 'or' }),
                    expect.objectContaining({ text: 'Another reason' }),
                  ],
                }),
              }),
            ],
          }),
        }),
      )
    })
  })

  describe('submitReason', () => {
    it('fetches the current valid reasons and saves the withdrawal when the submission is valid', async () => {
      req.body = { withdrawalReason: 'Ineligible referral', 'Ineligible referralDetails': 'No longer eligible.' }

      await controller.submitReason(req, res)

      expect(referralService.getWithdrawalReasons).toHaveBeenCalledWith('user1')
      expect(req.session.withdrawalReferrals[referralIdentifier]).toEqual({
        withdrawalReason: 'Ineligible referral',
        additionalInformation: 'No longer eligible.',
      })
      expect(res.redirect).toHaveBeenCalledWith(`/referral/${referralIdentifier}/withdraw/confirm`)
    })

    it('rejects a reason that is not in the current valid set', async () => {
      req.body = { withdrawalReason: 'not_a_real_reason' }

      await controller.submitReason(req, res)

      expect(res.redirect).not.toHaveBeenCalledWith(`/referral/${referralIdentifier}/withdraw/confirm`)
    })
  })

  it('submits withdrawal and returns to open cases when confirmed', async () => {
    await controller.submitConfirmation(req, res)

    expect(referralService.withdrawReferral).toHaveBeenCalledWith(
      caseIdentifier,
      {
        reasonCode: 'Not engaged',
        additionalDetails: 'No longer engaging',
      },
      'user1',
    )
    expect(res.redirect).toHaveBeenCalledWith('/cases-in-progress')
    expect(req.session.withdrawalReferrals[caseIdentifier]).toBeUndefined()
  })

  it('guards confirmation when no reason has been saved', async () => {
    req.session.withdrawalReferrals = {}

    await controller.submitConfirmation(req, res)

    expect(res.redirect).toHaveBeenCalledWith(`/referral/${caseIdentifier}/withdraw`)
    expect(referralService.withdrawReferral).not.toHaveBeenCalled()
  })

  it('renders service error page on unexpected error', async () => {
    referralService.withdrawReferral.mockRejectedValue(new Error('Unexpected service error'))

    await controller.submitConfirmation(req, res)

    expect(res.redirect).toHaveBeenCalledWith(`/referral/${caseIdentifier}/withdraw/service-error`)
  })

  it('redirects to referral details when referral has already been withdrawn by another user', async () => {
    referralService.withdrawReferral.mockRejectedValue({ responseStatus: 409 })
    referralService.getCaseDetailsByCaseIdentifier.mockResolvedValue({ id: 'referral-uuid' } as never)

    await controller.submitConfirmation(req, res)

    expect(referralService.getCaseDetailsByCaseIdentifier).toHaveBeenCalledWith(caseIdentifier, 'test-user')
    expect(res.redirect).toHaveBeenCalledWith('/referral-details/referral-uuid')
  })
})
