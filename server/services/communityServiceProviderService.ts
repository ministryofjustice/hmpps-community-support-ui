import CommunitySupportApiClient from '../data/communitySupportApiClient'

export default class CommunityServiceProviderService {
  constructor(private readonly communitySupportApiClient: CommunitySupportApiClient) {}

  async getCommunityServiceProviders(personDetailsId: string, username: string) {
    return this.communitySupportApiClient.getCommunitySupportServiceProviders(personDetailsId, username)
  }
}
