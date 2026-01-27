import { CreateReferralRequest } from '@community-support-api'
import CommunitySupportApiClient from '../data/communitySupportApiClient'

export default class ReferralService {
  constructor(private readonly communitySupportApiClient: CommunitySupportApiClient) {}

  async getReferralById(referralId: string, username: string) {
    return this.communitySupportApiClient.getReferralById(referralId, username)
  }

  async createReferral(referralData: CreateReferralRequest, username: string) {
    return this.communitySupportApiClient.createReferral(referralData, username)
  }

  async submitReferralById(referralId: string, username: string) {
    return this.communitySupportApiClient.submitReferralById(referralId, username)
  }
}
