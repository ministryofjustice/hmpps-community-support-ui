import { ProbationOffice } from '@community-support-api'
import { Prison } from '@prison-api'
import CommunitySupportApiClient from '../data/communitySupportApiClient'
import PrisonApiClient from '../data/prisonApiClient'

export default class ReferenceDataService {
  private static sysUserName: string = 'system'

  constructor(
    private readonly communitySupportApiClient: CommunitySupportApiClient,
    private readonly prisonApiClient: PrisonApiClient,
  ) {}

  getProbationOffices(): Promise<ProbationOffice[]> {
    return this.communitySupportApiClient.getProbationOffices(ReferenceDataService.sysUserName)
  }

  getPrisons(): Promise<Prison[]> {
    return this.prisonApiClient.getPrisons(ReferenceDataService.sysUserName)
  }
}
