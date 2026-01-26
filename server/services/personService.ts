import CommunitySupportApiClient from '../data/communitySupportApiClient'

export default class PersonService {
  constructor(private readonly communitySupportApiClient: CommunitySupportApiClient) {}

  async getPersonByIdentifier(personIdentifier: string, username: string) {
    return this.communitySupportApiClient.getPersonDetailsForPersonSearch(personIdentifier, username)
  }
}
