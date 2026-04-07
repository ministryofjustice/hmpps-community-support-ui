import { AppointmentIcsResponse } from '@community-support-api'
import CommunitySupportApiClient from '../data/communitySupportApiClient'

export default class AppointmentService {
  constructor(private communitySupportApiClient: CommunitySupportApiClient) {}

  getICS(referralId: string, icsId: string, username: string): Promise<AppointmentIcsResponse> {
    return this.communitySupportApiClient.getICS(referralId, icsId, username)
  }
}
