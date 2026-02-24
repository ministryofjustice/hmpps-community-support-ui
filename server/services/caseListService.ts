import { PagedRequest, CaseList } from '@community-support-api'
import CommunitySupportApiClient from '../data/communitySupportApiClient'
import { PagedResponse } from '../@types/communitySupportApi/derived'

export default class CaseListService {
  constructor(private communitySupportApiClient: CommunitySupportApiClient) {}

  async getCaseList(
    username: string,
    page: PagedRequest = { page: 0, size: 10 },
    assigned: boolean = false,
  ): Promise<PagedResponse<CaseList>> {
    return this.communitySupportApiClient.getCaseList(username, page, assigned)
  }
}
