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
      status: jest.fn().mockReturnThis(),
      render: jest.fn(),
      redirect: jest.fn(),
      locals: {
        user: { username: 'user1' },
        errors: { list: [], messages: {} },
        content: {
          pageHeader: "Why are you withdrawing {{ name }}'s referral?",
          additionalInformationLabel: 'Give details',
          continueButtonText: 'Continue',
          questionLabel: "Why are you withdrawing {{ name }}'s referral?",
          warningText: 'If you are withdrawing this referral, you cannot start or change it again.',
          withdrawButtonText: 'Withdraw referral',
          cancelLinkText: 'Cancel',
          changeLinkText: 'Change',
        },
      },
    } as unknown as Response
  })

  describe('showReason', () => {
    it('fetches withdrawal reasons from the referral service and renders the page', async () => {
      await controller.showReason(req, res)

      expect(referralService.getWithdrawalReasons).toHaveBeenCalledWith('user1')
      expect(referralService.getCaseDetailsByCaseIdentifier).toHaveBeenCalledWith(caseIdentifier, 'user1')
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
      expect(req.session.withdrawalReferrals[caseIdentifier]).toEqual({
        withdrawalReason: 'Ineligible referral',
        additionalInformation: 'No longer eligible.',
      })
      expect(res.redirect).toHaveBeenCalledWith(`/referral/${caseIdentifier}/withdraw/confirm`)
    })
  })

  describe('submitConfirmation', () => {
    it('submits withdrawal and redirects to referral details when confirmed', async () => {
      await controller.submitConfirmation(req, res)

      expect(referralService.withdrawReferral).toHaveBeenCalledWith(
        caseIdentifier,
        {
          reasonCode: 'Not engaged',
          additionalDetails: 'No longer engaging',
        },
        'user1',
      )
      expect(req.session.referralDetailsNotification).toEqual({
        type: 'success',
        code: 'withdrawalCompleted',
        caseReference: caseIdentifier,
      })
      expect(res.redirect).toHaveBeenCalledWith(`/referral-details/${caseIdentifier}`)
      expect(req.session.withdrawalReferrals[caseIdentifier]).toBeUndefined()
    })

    it('stores a referral details notification and redirects when the referral was already withdrawn', async () => {
      referralService.withdrawReferral.mockRejectedValue({ responseStatus: 409 })

      await controller.submitConfirmation(req, res)

      expect(req.session.referralDetailsNotification).toEqual({
        type: 'warning',
        code: 'withdrawalAlreadyCompleted',
        caseReference: caseIdentifier,
      })
      expect(res.redirect).toHaveBeenCalledWith(`/referral-details/${caseIdentifier}`)
    })
  })

  describe('showServiceError', () => {
    it('renders the shared error page with a case list button', async () => {
      res.locals.content = {
        pageHeader: 'Sorry, there is a problem with this service',
        message: 'Try again later.',
        goToCaseListLink: '/cases-in-progress',
        goToCaseListButtonText: 'Go to case list',
      }

      await controller.showServiceError(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.render).toHaveBeenCalledWith('pages/error', {
        systemError: {
          heading: 'Sorry, there is a problem with this service',
          message: 'Try again later.',
          buttonText: 'Go to case list',
          buttonUrl: '/cases-in-progress',
        },
      })
    })
  })
})
