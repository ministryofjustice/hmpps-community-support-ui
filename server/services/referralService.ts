import {
  CreateReferralRequest,
  ReferralUserAssignmentsRequest,
  ReferralDetailsResponseDto,
  ReferralInformation,
  ReferralProgress,
  ConfirmPersonDetailsBffDto,
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

  async getReferralUserAssignments(caseIdentifier: string, username: string) {
    return this.communitySupportApiClient.getReferralUserAssignments(caseIdentifier, username)
  }

  async submitReferralUserAssignments(
    caseIdentifier: string,
    assignmentsData: ReferralUserAssignmentsRequest,
    username: string,
  ) {
    return this.communitySupportApiClient.submitReferralUserAssignments(caseIdentifier, assignmentsData, username)
  }

  getReferralProgress(caseReference: string, username: string): Promise<ReferralProgress> {
    return this.communitySupportApiClient.getReferralProgress(caseReference, username)
  }

  getReferralInformation(caseIdentifier: string, username: string): Promise<ReferralInformation> {
    return this.communitySupportApiClient.getReferralInformation(caseIdentifier, username)
  }

  getPersonalDetails(id: string, username: string): Promise<ConfirmPersonDetailsBffDto> {
    return this.communitySupportApiClient.getPersonalDetails(id, username)
  }
}
