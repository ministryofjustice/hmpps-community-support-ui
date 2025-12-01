import { Referral } from '@community-support-api'
import CommunitySupportApiClient from '../data/communitySupportApiClient'
import ReferralService from './referralService'

jest.mock('../data/communitySupportApiClient')

describe('Referral service tests', () => {
  let communitySupportApiClient: jest.Mocked<CommunitySupportApiClient>
  let referralService: ReferralService

  beforeEach(() => {
    communitySupportApiClient = new CommunitySupportApiClient(null) as jest.Mocked<CommunitySupportApiClient>
    referralService = new ReferralService(communitySupportApiClient)
  })

  describe('getReferralById', () => {
    it('should return referral data from API client', async () => {
      const mockReferralData = { id: 'referral123' } as Referral
      communitySupportApiClient.getReferralById.mockResolvedValue(mockReferralData)
      const result = await referralService.getReferralById('referral123', 'user1')
      expect(result).toBe(mockReferralData)
      expect(communitySupportApiClient.getReferralById).toHaveBeenCalledWith('referral123', 'user1')
    })
  })
})
