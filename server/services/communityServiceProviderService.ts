import CommunitySupportApiClient from '../data/communitySupportApiClient'

export default class CommunityServiceProviderService {
  constructor(private readonly communitySupportApiClient: CommunitySupportApiClient) {}

  async getCommunityServiceProviders(personDetailsId: string, username: string) {
    return this.communitySupportApiClient.getCommunitySupportServiceProviders(personDetailsId, username)
  }

  async getCommunityServiceProviderDetails(referralId: string, providerId: string, username: string) {
    return this.communitySupportApiClient.getCommunityServiceProviderDetails(referralId, providerId, username)
  }

  async saveCommunityServiceProvider(referralId: string, providerId: string, username: string) {
    return this.communitySupportApiClient.saveCommunityServiceProvider(
      referralId,
      { communityServiceProviderId: providerId },
      username,
    )
  }
}
