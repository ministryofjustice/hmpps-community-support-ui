import { CaseList } from '@community-support-api'
import CommunitySupportApiClient from '../data/communitySupportApiClient'
import CaseListService from './caseListService'

jest.mock('../data/communitySupportApiClient.ts')

describe('CaseListService', () => {
  let communitySupportApiClient: jest.Mocked<CommunitySupportApiClient>

  beforeEach(() => {
    communitySupportApiClient = new CommunitySupportApiClient(null) as jest.Mocked<CommunitySupportApiClient>
  })
  it('should return a case list response', async () => {
    const mockCaseListResponse = {
      content: [] as Array<CaseList>,
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    }
    communitySupportApiClient.getCaseList.mockResolvedValue(mockCaseListResponse)
    const caseListService = new CaseListService(communitySupportApiClient)
    const response = await caseListService.getCaseList('testuser', { page: 0, size: 10 }, false)
    expect(response).toBeDefined()
    expect(response.page).toBe(0)
    expect(response.size).toBe(10)
    expect(response.content).toBeInstanceOf(Array)
  })
})
