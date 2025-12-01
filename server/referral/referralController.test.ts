import { Request, Response } from 'express'
import ReferralController from './referralController'
import ReferralService from '../services/referralService'

jest.mock('../services/referralService')

describe('ReferralController', () => {
  let referralService: jest.Mocked<ReferralService>
  let referralController: ReferralController
  let req: Request
  let res: Response
  let next: jest.Mock

  beforeEach(() => {
    referralService = {
      getReferralById: jest.fn(),
    } as unknown as jest.Mocked<ReferralService>
    referralController = new ReferralController(referralService)

    req = {
      params: { id: 'referral123' },
    } as unknown as Request
    res = {
      locals: { user: { username: 'user1' } },
      render: jest.fn(),
    } as unknown as Response
    next = jest.fn()
  })

  describe('showReferralPage', () => {
    it('should render referral page with referral data', async () => {
      const mockReferralData = { id: 'referral123' }
      referralService.getReferralById.mockResolvedValue(mockReferralData)

      await referralController.showReferralPage(req, res, next)

      expect(referralService.getReferralById).toHaveBeenCalledWith('referral123', 'user1')
      expect(res.render).toHaveBeenCalledWith('referral/referral', { referral: mockReferralData })
    })
  })
})
