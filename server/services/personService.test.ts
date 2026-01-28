import { Person } from '@community-support-api'
import CommunitySupportApiClient from '../data/communitySupportApiClient'
import PersonService from './personService'

jest.mock('../data/communitySupportApiClient')

describe('Referral service tests', () => {
  let communitySupportApiClient: jest.Mocked<CommunitySupportApiClient>
  let personService: PersonService

  beforeEach(() => {
    communitySupportApiClient = new CommunitySupportApiClient(null) as jest.Mocked<CommunitySupportApiClient>
    personService = new PersonService(communitySupportApiClient)
  })

  describe('getPersonByIdentifier', () => {
    it('should return person data from API client', async () => {
      const mockPersonData = { personIdentifier: 'person123' } as Person
      communitySupportApiClient.getPersonDetailsForPersonSearch.mockResolvedValue(mockPersonData)
      const result = await personService.getPersonByIdentifier('person123', 'user1')
      expect(result).toBe(mockPersonData)
      expect(communitySupportApiClient.getPersonDetailsForPersonSearch).toHaveBeenCalledWith('person123', 'user1')
    })
  })
})
