import { CreateReferralRequest, ReferralUserAssignmentsRequest, ReferralDetailsResponseDto } from '@community-support-api'
import CommunitySupportApiClient from '../data/communitySupportApiClient'

export default class ReferralService {
  constructor(private readonly communitySupportApiClient: CommunitySupportApiClient) { }

  getCaseDetailsById(referralId: string, username: string): Promise<ReferralDetailsResponseDto> {
    return this.communitySupportApiClient.getCaseDetailsById(referralId, username)
  }

  async getReferralById(referralId: string, username: string) {
    return this.communitySupportApiClient.getReferralById(referralId, username)
  }

  async createReferral(referralData: CreateReferralRequest, username: string) {
    return this.communitySupportApiClient.createReferral(referralData, username)
  }

  async submitReferralById(referralId: string, username: string) {
    return this.communitySupportApiClient.submitReferralById(referralId, username)
  }

  async getReferralUserAssignments(referralId: string, username: string) {
    return this.communitySupportApiClient.getReferralUserAssignments(referralId, username)
  }

  async submitReferralUserAssignments(
    referralId: string,
    assignmentsData: ReferralUserAssignmentsRequest,
    username: string,
  ) {
    return this.communitySupportApiClient.submitReferralUserAssignments(referralId, assignmentsData, username)
  }
}
