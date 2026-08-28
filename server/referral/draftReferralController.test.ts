import { Request, Response } from 'express'
import { CheckDraftReferralDetailsDto } from '@community-support-api'
import DraftReferralController from './draftReferralController'
import ReferralService from '../services/referralService'
import CheckReferralInformationPresenter from './check-referral-information/checkReferralInformationPresenter'

jest.mock('../services/referralService')
jest.mock('./check-referral-information/checkReferralInformationPresenter')

describe('DraftReferralController', () => {
  let referralService: jest.Mocked<ReferralService>
  let draftReferralController: DraftReferralController
  let req: Request
  let res: Response

  beforeEach(() => {
    referralService = {
      getCheckDraftReferralDetails: jest.fn(),
      submitReferralById: jest.fn(),
    } as unknown as jest.Mocked<ReferralService>
    draftReferralController = new DraftReferralController(referralService)

    CheckReferralInformationPresenter.prototype.renderPage = jest.fn()

    req = {
      params: { referralId: 'referral123' },
      flash: jest.fn(),
      session: {},
    } as unknown as Request
    res = {
      locals: { user: { username: 'user1' } },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response
  })

  describe('checkReferralInformation', () => {
    it('should redirect to find a person when there is no draft referral in session', async () => {
      await draftReferralController.checkReferralInformation(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/referral/new/find-a-person')
      expect(referralService.getCheckDraftReferralDetails).not.toHaveBeenCalled()
    })

    it('should retrieve the draft referral details and render the page', async () => {
      req.session.draftReferralId = 'referral123'
      const draftReferralDetails = {} as CheckDraftReferralDetailsDto
      referralService.getCheckDraftReferralDetails.mockResolvedValue(draftReferralDetails)

      await draftReferralController.checkReferralInformation(req, res)

      expect(referralService.getCheckDraftReferralDetails).toHaveBeenCalledWith('referral123', 'user1')
      expect(CheckReferralInformationPresenter).toHaveBeenCalledWith(draftReferralDetails)
      expect(CheckReferralInformationPresenter.prototype.renderPage).toHaveBeenCalledWith(res)
    })
  })

  describe('submitReferralInformation', () => {
    it('should redirect to the confirmation page after submitting the referral', async () => {
      referralService.submitReferralById.mockResolvedValue({ referralId: 'submitted123', personId: 'person123' })

      await draftReferralController.submitReferralInformation(req, res)

      expect(referralService.submitReferralById).toHaveBeenCalledWith('referral123', 'user1')
      expect(res.redirect).toHaveBeenCalledWith('/referral/submitted123/confirmation')
    })

    it('should redirect to confirmation when the referral has already been submitted', async () => {
      referralService.submitReferralById.mockRejectedValue({ responseStatus: 409 })

      await draftReferralController.submitReferralInformation(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/referral/referral123/confirmation')
    })
  })
})
