import { ApiConfig, RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import type {
  CommunitySupportServicesProvider,
  Referral,
  Person,
  CreateReferralRequest,
  ReferralInformationDto,
  SubmitReferralResponseDto,
} from '@community-support-api'
import config from '../config'
import logger from '../../logger'

export default class CommunitySupportApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient, apiConfig: ApiConfig = null) {
    super('Community Support API', apiConfig || config.apis.communitySupportService, logger, authenticationClient)
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

  async getPersonByIdentifier(personIdentifier: string, username: string): Promise<Person> {
    return this.get({ path: `/bff/person/${personIdentifier}` }, asSystem(username))
  }

  async createReferral(referralData: CreateReferralRequest, username: string): Promise<ReferralInformationDto> {
    console.log('Creating referral with data:', referralData)
    return this.post({ path: '/bff/referral', data: referralData }, asSystem(username))
  }

  async submitReferralById(referralId: string, username: string): Promise<SubmitReferralResponseDto> {
    return this.post({ path: `/bff/${referralId}/submit-a-referral` }, asSystem(username))
  }
}
