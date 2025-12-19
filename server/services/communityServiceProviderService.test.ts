import { CommunitySupportServicesProvider } from '@community-support-api'
import CommunitySupportApiClient from '../data/communitySupportApiClient'
import CommunityServiceProviderService from './communityServiceProviderService'

jest.mock('../data/communitySupportApiClient')

describe('CommunityServiceProvider service tests', () => {
  let communitySupportApiClient: jest.Mocked<CommunitySupportApiClient>
  let communityServiceProviderService: CommunityServiceProviderService

  beforeEach(() => {
    communitySupportApiClient = new CommunitySupportApiClient(null) as jest.Mocked<CommunitySupportApiClient>
    communityServiceProviderService = new CommunityServiceProviderService(communitySupportApiClient)
  })

  describe('getCommunityServiceProviders', () => {
    it('should return community service providers data from API client', async () => {
      const mockCommunityServiceProviderData = {
        personId: 'personDetails123',
        communitySupportServices: [
          { id: 'service1', region: 'Region 1', name: 'Service 1' },
          { id: 'service2', region: 'Region 2', name: 'Service 2' },
        ],
      } as CommunitySupportServicesProvider
      communitySupportApiClient.getCommunitySupportServiceProviders.mockResolvedValue(mockCommunityServiceProviderData)
      const result = await communityServiceProviderService.getCommunityServiceProviders('personDetails123', 'user1')
      expect(result).toBe(mockCommunityServiceProviderData)
      expect(communitySupportApiClient.getCommunitySupportServiceProviders).toHaveBeenCalledWith(
        'personDetails123',
        'user1',
      )
    })
  })
})
