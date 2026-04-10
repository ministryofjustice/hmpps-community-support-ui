import { AppointmentIcsResponse } from '@community-support-api'
import CommunitySupportApiClient from '../data/communitySupportApiClient'

export default class AppointmentService {
  constructor(private communitySupportApiClient: CommunitySupportApiClient) {}

  getICS(caseRefId: string, username: string): Promise<AppointmentIcsResponse> {
    return this.communitySupportApiClient.getICS(caseRefId, username)
  }
}
