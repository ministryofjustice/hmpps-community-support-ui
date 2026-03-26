import { ApiConfig, RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import type { Prison } from '@prison-api'
import config from '../config'
import logger from '../../logger'

export default class PrisonApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient, apiConfig: ApiConfig = null) {
    super('Prison API', apiConfig || config.apis.prisonApiService, logger, authenticationClient)
  }

  async getPrisons(username: string): Promise<Prison[]> {
    return this.get({ path: `/api/agencies/prisons` }, asSystem(username))
  }
}
