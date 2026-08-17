import { CommunitySupportServicesProvider, AreaConfirmationBffResponseDto } from '@community-support-api'
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
      const mockCommunityServiceProviderData: CommunitySupportServicesProvider = {
        communitySupportServices: {
          region1: [
            {
              id: 'service1',
              region: 'Region 1',
              name: 'Service 1',
              area: 'Area 1',
              providerName: 'Provider 1',
              description: 'Description 1',
              pdus: ['PDU1'],
            },
          ],
          region2: [
            {
              id: 'service2',
              region: 'Region 2',
              area: 'Area 2',
              name: 'Service 2',
              providerName: 'Provider 2',
              description: 'Description 2',
              pdus: ['PDU2'],
            },
          ],
        },
      }
      communitySupportApiClient.getCommunitySupportServiceProviders.mockResolvedValue(mockCommunityServiceProviderData)
      const result = await communityServiceProviderService.getCommunityServiceProviders('personDetails123', 'user1')
      expect(result).toBe(mockCommunityServiceProviderData)
      expect(communitySupportApiClient.getCommunitySupportServiceProviders).toHaveBeenCalledWith(
        'personDetails123',
        'user1',
      )
    })
  })

  describe('getCommunityServiceProviderDetails', () => {
    it('should return community service provider details from API client', async () => {
      const mockProviderDetails: AreaConfirmationBffResponseDto = {
        deliveryPartner: 'Ingeus UK Limited',
        contractArea: 'Avon and Somerset, Gloucestershire, Wiltshire.',
        associatedPdus: ['Bath and North Somerset', 'Bristol and South Gloucestershire'],
        crn: 'X123456',
        dateOfBirth: '1975-02-20',
      }
      communitySupportApiClient.getCommunityServiceProviderDetails.mockResolvedValue(mockProviderDetails)

      const result = await communityServiceProviderService.getCommunityServiceProviderDetails(
        'referral-id-123',
        'provider-id-123',
        'user1',
      )

      expect(result).toBe(mockProviderDetails)
      expect(communitySupportApiClient.getCommunityServiceProviderDetails).toHaveBeenCalledWith(
        'referral-id-123',
        'provider-id-123',
        'user1',
      )
    })
  })

  describe('saveCommunityServiceProvider', () => {
    it('should save the selected provider via the API client', async () => {
      communitySupportApiClient.saveCommunityServiceProvider.mockResolvedValue(undefined)

      await communityServiceProviderService.saveCommunityServiceProvider('referral-id-123', 'provider-id-123', 'user1')

      expect(communitySupportApiClient.saveCommunityServiceProvider).toHaveBeenCalledWith(
        'referral-id-123',
        { communityServiceProviderId: 'provider-id-123' },
        'user1',
      )
    })
  })
})
