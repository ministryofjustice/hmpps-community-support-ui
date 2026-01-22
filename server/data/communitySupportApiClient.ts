import { ApiConfig, RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import type {
  CommunitySupportServicesProvider,
  Referral,
  Person,
  CreateReferralRequest,
  ReferralInformation,
  SubmitReferralResponse,
  CaseList,
  PagedRequest,
  ReferralUserAssignmentsRequest,
  ReferralUserAssignmentsResponse,
  CaseWorkerDto,
  ReferralInformation,
  SubmitReferralResponse,
  CaseList,
  PagedRequest,
  ReferralDetailsResponseDto,
} from '@community-support-api'
import config from '../config'
import logger from '../../logger'
import { PagedResponse } from '../@types/communitySupportApi/derived'

export default class CommunitySupportApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient, apiConfig: ApiConfig = null) {
    super('Community Support API', apiConfig || config.apis.communitySupportService, logger, authenticationClient)
  }

  getCaseDetailsById(referralId: string, username: string): Promise<ReferralDetailsResponseDto> {
    return this.get({ path: `/bff/referral-details-pages/${referralId}` }, asSystem(username))
  }

  async getReferralById(referralId: string, username: string): Promise<Referral> {
    return this.get({ path: `/bff/referral-details/${referralId}` }, asSystem(username))
  }

  async getCommunitySupportServiceProviders(
    personDetailsId: string,
    username: string,
  ): Promise<CommunitySupportServicesProvider> {
    return this.get({ path: `/bff/referral-select-a-service?personDetailsId=${personDetailsId}` }, asSystem(username))
  }

  async getPersonDetailsForPersonSearch(personIdentifier: string, username: string): Promise<Person> {
    return this.get({ path: `/bff/person/${personIdentifier}` }, asSystem(username))
  }

  async createReferral(referralData: CreateReferralRequest, username: string): Promise<ReferralInformation> {
    return this.post({ path: '/bff/referral', data: referralData }, asSystem(username))
  }

  async submitReferralById(referralId: string, username: string): Promise<SubmitReferralResponse> {
    return this.post({ path: `/bff/${referralId}/submit-a-referral` }, asSystem(username))
  }

  async getCaseList(username: string, page: PagedRequest, assigned: boolean = false): Promise<PagedResponse<CaseList>> {
    return this.get(
      { path: `/bff/case-list/${!assigned ? 'unassigned' : 'in-progress'}?page=${page.page}&size=${page.size}` },
      asSystem(username),
    )
  }

  async getReferralUserAssignments(referralId: string, username: string): Promise<CaseWorkerDto[]> {
    return this.get({ path: `/bff/referral-assignments/${referralId}` }, asSystem(username))
  }

  async submitReferralUserAssignments(
    referralId: string,
    assignmentsData: ReferralUserAssignmentsRequest,
    username: string,
  ): Promise<ReferralUserAssignmentsResponse> {
    return this.post({ path: `/referral/${referralId}/assign`, data: assignmentsData }, asSystem(username))
  }
}
