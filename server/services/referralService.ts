import {
  CreateReferralRequest,
  ReferralUserAssignmentsRequest,
  ReferralDetailsResponseDto,
  ReferralInformation,
  ReferralProgress,
  ConfirmPersonDetailsBffDto,
  AdditionalSupportNeedsDto,
  TaskListStatusDto,
  NeedsInterpreterBffResponseDto,
  CommunitySupportRiskDto,
  CommunitySupportRiskInformationDto,
  type ReferralCriminogenicNeedsDto,
  type CriminogenicNeedsRequest,
} from '@community-support-api'
import CommunitySupportApiClient from '../data/communitySupportApiClient'

export default class ReferralService {
  constructor(private readonly communitySupportApiClient: CommunitySupportApiClient) {}

  getCaseDetailsByCaseIdentifier(caseIdentifier: string, username: string): Promise<ReferralDetailsResponseDto> {
    return this.communitySupportApiClient.getCaseDetailsById(caseIdentifier, username)
  }

  getReferralById(referralId: string, username: string) {
    return this.communitySupportApiClient.getReferralById(referralId, username)
  }

  createReferral(referralData: CreateReferralRequest, username: string): Promise<ReferralInformation> {
    return this.communitySupportApiClient.createReferral(referralData, username)
  }

  submitReferralById(referralId: string, username: string) {
    return this.communitySupportApiClient.submitReferralById(referralId, username)
  }

  getReferralUserAssignments(caseIdentifier: string, username: string) {
    return this.communitySupportApiClient.getReferralUserAssignments(caseIdentifier, username)
  }

  submitReferralUserAssignments(
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

  getAdditionalSupportNeeds(id: string, username: string): Promise<AdditionalSupportNeedsDto> {
    return this.communitySupportApiClient.getAdditionalSupportNeeds(id, username)
  }

  getTaskListStatus(referralId: string, username: string): Promise<TaskListStatusDto> {
    return this.communitySupportApiClient.getTaskListStatus(referralId, username)
  }

  getNeedsInterpreterPageData(referralId: string, username: string): Promise<NeedsInterpreterBffResponseDto> {
    return this.communitySupportApiClient.getNeedsInterpreterPageData(referralId, username)
  }

  getRoshRisksByReferralId(referralId: string, username: string): Promise<CommunitySupportRiskDto> {
    return this.communitySupportApiClient.getRoshRisksByReferralId(referralId, username)
  }

  saveRiskInformation(
    referralId: string,
    riskInformation: CommunitySupportRiskInformationDto,
    username: string,
  ): Promise<CommunitySupportRiskInformationDto> {
    return this.communitySupportApiClient.saveRiskInformation(referralId, riskInformation, username)
  }

  savePersonalDetailsConfirmed(draftReferralId: string, username: string): Promise<void> {
    return this.communitySupportApiClient.savePersonalDetailsConfirmed(draftReferralId, username)
  }

  getPersonNeeds(draftReferralId: string, username: string): Promise<ReferralCriminogenicNeedsDto> {
    return this.communitySupportApiClient.getPersonNeeds(draftReferralId, username)
  }

  savePersonNeeds(
    draftReferralId: string,
    personNeeds: CriminogenicNeedsRequest,
    username: string,
  ): Promise<ReferralCriminogenicNeedsDto> {
    return this.communitySupportApiClient.savePersonNeeds(draftReferralId, personNeeds, username)
  }
}
