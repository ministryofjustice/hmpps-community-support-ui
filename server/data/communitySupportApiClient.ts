import { ApiConfig, RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import type { Referral } from '@community-support-api'
import config from '../config'
import logger from '../../logger'

export default class CommunitySupportApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient, apiConfig: ApiConfig = null) {
    super('Community Support API', apiConfig || config.apis.communitySupportService, logger, authenticationClient)
  }

  async getReferralById(referralId: string, username: string): Promise<Referral> {
    return this.get({ path: `/referrals/${referralId}` }, asSystem(username))
  }
}
