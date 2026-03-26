import { ProbationOffice } from '@community-support-api'
import { Prison } from '@prison-api'
import CommunitySupportApiClient from '../data/communitySupportApiClient'
import PrisonApiClient from '../data/prisonApiClient'

export default class ReferenceDataService {
  private static sysUserName: string = 'system'

  private probationOfficesPromise?: Promise<ProbationOffice[]> = null

  private prisonsPromise?: Promise<Prison[]> = null

  constructor(
    private readonly communitySupportApiClient: CommunitySupportApiClient,
    private readonly prisonApiClient: PrisonApiClient,
  ) {}

  async getProbationOffices() {
    if (!this.probationOfficesPromise) {
      this.probationOfficesPromise = this.communitySupportApiClient.getProbationOffices(
        ReferenceDataService.sysUserName,
      )
    }
    return this.probationOfficesPromise
  }

  async getPrisons() {
    if (!this.prisonsPromise) {
      this.prisonsPromise = this.prisonApiClient.getPrisons(ReferenceDataService.sysUserName)
    }
    return this.prisonsPromise
  }
}
