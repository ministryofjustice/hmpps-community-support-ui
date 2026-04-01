import {
  CreateReferralRequest,
  ReferralUserAssignmentsRequest,
  ReferralDetailsResponseDto,
  ReferralProgress,
} from '@community-support-api'
import CommunitySupportApiClient from '../data/communitySupportApiClient'

export default class ReferralService {
  constructor(private readonly communitySupportApiClient: CommunitySupportApiClient) {}

  getCaseDetailsByCaseIdentifier(caseIdentifier: string, username: string): Promise<ReferralDetailsResponseDto> {
    return this.communitySupportApiClient.getCaseDetailsById(caseIdentifier, username)
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

  getReferralProgress(caseReference: string, username: string): Promise<ReferralProgress> {
    return this.communitySupportApiClient.getReferralProgress(caseReference, username)
  }
}
