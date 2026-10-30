import {
  CreateReferralRequest,
  ReferralUserAssignmentsRequest,
  ReferralDetailsResponseDto,
  ReferralInformation,
  ReferralProgress,
  ReferralAppointmentsBffResponseDto,
  ConfirmPersonDetailsBffDto,
  AdditionalSupportNeedsDto,
  TaskListStatusDto,
  NeedsInterpreterBffResponseDto,
  CommunitySupportRiskDto,
  CommunitySupportRiskInformationDto,
  type CommunitySupportServicesProvider,
  type ReferralCriminogenicNeedsDto,
  type CriminogenicNeedsRequest,
  ActionPlanSummaryDto,
  ActionPlanActionRequest,
  ActionPlanActionResponse,
  ActionPlanSessionDeliveryDetailsResponse,
  ActionPlanSessionDeliveryDetailsRequest,
  ActionPlanSelectANeedResponse,
  ServiceEndDatePageDto,
  ServiceDaysPageDto,
  AdditionalSupportNeedsRequest,
  OffenceSentenceRequest,
  OffenceSentenceInfoBffResponseDto,
  type ProbationPractitionerDetails,
  type UpdateProbationPractitionerDetailsRequest,
  CheckDraftReferralDetailsDto,
  type ProbationOffice,
  PDU,
  Selection,
  WithdrawReferralRequest,
  WithdrawalReasonsGroupedBffResponseDto,
  ActionPlanNeedsOrderRequest,
  ActionPlanSubmitResponse,
} from '@community-support-api'
import CommunitySupportApiClient from '../data/communitySupportApiClient'
import { NeedsAnInterpreterFormData } from '../validation/NeedsAnInterpreterFormDataSchema'
import { AdditionalInformationForTheDeliveryPartnerFormData } from '../validation/AdditionalInformationForTheDeliveryPartnerFormData'

export type ActionPlanCheckYourAnswersDetails = {
  sessionDetails: ActionPlanSessionDeliveryDetailsResponse
  risksAndAdjustments: ActionPlanSessionDeliveryDetailsResponse
  serviceEndDate: ActionPlanSessionDeliveryDetailsResponse
  personInvolvement: ActionPlanSessionDeliveryDetailsResponse
}

export default class ReferralService {
  constructor(private readonly communitySupportApiClient: CommunitySupportApiClient) {}

  getCaseDetailsByCaseIdentifier(caseIdentifier: string, username: string): Promise<ReferralDetailsResponseDto> {
    return this.communitySupportApiClient.getCaseDetailsById(caseIdentifier, username)
  }

  getReferralById(referralId: string, username: string) {
    return this.communitySupportApiClient.getReferralById(referralId, username)
  }

  getWithdrawalReasons(username: string): Promise<WithdrawalReasonsGroupedBffResponseDto> {
    return this.communitySupportApiClient.getWithdrawalReasons(username)
  }

  createReferral(referralData: CreateReferralRequest, username: string): Promise<ReferralInformation> {
    return this.communitySupportApiClient.createReferral(referralData, username)
  }

  getCheckDraftReferralDetails(referralId: string, username: string): Promise<CheckDraftReferralDetailsDto> {
    return this.communitySupportApiClient.getCheckDraftReferralDetails(referralId, username)
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

  getReferralAppointments(caseReference: string, username: string): Promise<ReferralAppointmentsBffResponseDto> {
    return this.communitySupportApiClient.getReferralAppointments(caseReference, username)
  }

  getReferralInformation(caseIdentifier: string, username: string): Promise<ReferralInformation> {
    return this.communitySupportApiClient.getReferralInformation(caseIdentifier, username)
  }

  getActionPlanSummary(caseReference: string, username: string): Promise<ActionPlanSummaryDto> {
    return this.communitySupportApiClient.getActionPlanSummary(caseReference, username)
  }

  submitAction(
    caseReference: string,
    actionPlanAction: ActionPlanActionRequest,
    username: string,
  ): Promise<ActionPlanActionResponse> {
    return this.communitySupportApiClient.submitAction(caseReference, actionPlanAction, username)
  }

  deleteAction(caseReference: string, actionId: string, username: string): Promise<ActionPlanActionResponse> {
    return this.communitySupportApiClient.deleteAction(caseReference, actionId, username)
  }

  getSessionDeliveryDetails(
    caseReference: string,
    username: string,
  ): Promise<ActionPlanSessionDeliveryDetailsResponse> {
    return this.communitySupportApiClient.getSessionDeliveryDetails(caseReference, username)
  }

  submitServiceDeliveryDetails(
    caseReference: string,
    request: ActionPlanSessionDeliveryDetailsRequest,
    username: string,
  ): Promise<ActionPlanSessionDeliveryDetailsResponse> {
    return this.communitySupportApiClient.submitServiceDeliveryDetails(caseReference, request, username)
  }

  submitActionPlan(caseReference: string, username: string): Promise<ActionPlanSubmitResponse> {
    return this.communitySupportApiClient.submitActionPlan(caseReference, username)
  }

  getRisksAndAdjustments(caseReference: string, username: string): Promise<ActionPlanSessionDeliveryDetailsResponse> {
    return this.communitySupportApiClient.getRisksAndAdjustments(caseReference, username)
  }

  async getCheckYourAnswers(
    caseReference: string,
    username: string,
    isServiceEndDateChanged: boolean,
  ): Promise<ActionPlanCheckYourAnswersDetails> {
    const { questions } = await this.communitySupportApiClient.getSessionDeliveryCheckYourAnswers(
      caseReference,
      username,
      isServiceEndDateChanged,
    )
    return {
      sessionDetails: {
        questions: questions.filter(question =>
          ['SESSION_FREQUENCY', 'SESSION_DELIVERY_METHOD', 'SESSION_FORMAT'].includes(question.key),
        ),
      },
      risksAndAdjustments: {
        questions: questions.filter(question =>
          ['RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES', 'REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES'].includes(
            question.key,
          ),
        ),
      },
      serviceEndDate: {
        questions: questions.filter(question =>
          ['SERVICE_END_DATE_CHECK', 'NEW_SERVICE_END_DATE', 'SERVICE_END_DATE_CHANGE_REASON'].includes(question.key),
        ),
      },
      personInvolvement: {
        questions: questions.filter(question => question.key === 'USER_INVOLVEMENT_IN_ACTION_PLAN'),
      },
    }
  }

  getServiceEndDateCheck(caseReference: string, username: string): Promise<ActionPlanSessionDeliveryDetailsResponse> {
    return this.communitySupportApiClient.getServiceEndDateCheck(caseReference, username)
  }

  getUpdateServiceEndDate(caseReference: string, username: string): Promise<ActionPlanSessionDeliveryDetailsResponse> {
    return this.communitySupportApiClient.getUpdateServiceEndDate(caseReference, username)
  }

  getActionPlanNeedsAndOutcomes(referralReference: string, username: string): Promise<ActionPlanSelectANeedResponse> {
    return this.communitySupportApiClient.getActionPlanNeedsAndOutcomes(referralReference, username)
  }

  getPersonInvolvement(caseReference: string, username: string): Promise<ActionPlanSessionDeliveryDetailsResponse> {
    return this.communitySupportApiClient.getPersonInvolvement(caseReference, username)
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

  getServiceEndDatePage(referralId: string, username: string): Promise<ServiceEndDatePageDto> {
    return this.communitySupportApiClient.getServiceEndDatePage(referralId, username)
  }

  getServiceDaysPage(referralId: string, username: string): Promise<ServiceDaysPageDto> {
    return this.communitySupportApiClient.getServiceDaysPage(referralId, username)
  }

  updateServiceDaysPage(referralId: string, data: ServiceDaysPageDto, username: string): Promise<ServiceDaysPageDto> {
    return this.communitySupportApiClient.updateServiceDaysPage(referralId, data, username)
  }

  getOffenceSentencePage(referralId: string, username: string): Promise<OffenceSentenceInfoBffResponseDto> {
    return this.communitySupportApiClient.getOffenceSentencePage(referralId, username)
  }

  updateOffenceSentencePage(
    referralId: string,
    data: OffenceSentenceRequest,
    username: string,
  ): Promise<OffenceSentenceInfoBffResponseDto> {
    return this.communitySupportApiClient.updateOffenceSentencePage(referralId, data, username)
  }

  updateServiceEndDatePage(
    referralId: string,
    data: ServiceEndDatePageDto,
    username: string,
  ): Promise<ServiceEndDatePageDto> {
    return this.communitySupportApiClient.updateServiceEndDatePage(referralId, data, username)
  }

  getCommunitySupportServiceProviders(
    personDetailsId: string,
    username: string,
  ): Promise<CommunitySupportServicesProvider> {
    return this.communitySupportApiClient.getCommunitySupportServiceProviders(personDetailsId, username)
  }

  submitAdditionalSupportNeeds(data: AdditionalSupportNeedsRequest, referralId: string, username: string) {
    return this.communitySupportApiClient.submitAdditionalSupportNeeds(data, referralId, username)
  }

  submitNeedsAnInterpreter(body: NeedsAnInterpreterFormData, draftReferralId: string, username: string) {
    return this.communitySupportApiClient.submitNeedsAnInterpreter(body, draftReferralId, username)
  }

  getPPDetails(referralId: string, username: string): Promise<ProbationPractitionerDetails> {
    return this.communitySupportApiClient.getPPDetails(referralId, username)
  }

  submitPPDetails(referralId: string, username: string, ppDetails: UpdateProbationPractitionerDetailsRequest) {
    return this.communitySupportApiClient.submitPPDetails(referralId, username, ppDetails)
  }

  submitContactDetails(
    referralId: string,
    username: string,
    contactDetails: UpdateProbationPractitionerDetailsRequest,
  ) {
    return this.communitySupportApiClient.submitContactDetails(referralId, username, contactDetails)
  }

  getProbationOffices(username: string): Promise<ProbationOffice[]> {
    return this.communitySupportApiClient.getProbationOffices(username)
  }

  getPDUs(username: string): Promise<PDU[]> {
    return this.communitySupportApiClient.getPDUs(username)
  }

  getAdditionalInformationForDeliveryPartner(draftReferralId: string, username: string) {
    return this.communitySupportApiClient.getAdditionalInformationForDeliveryPartner(draftReferralId, username)
  }

  submitAdditionalInformationForDeliveryPartner(
    data: AdditionalInformationForTheDeliveryPartnerFormData,
    draftReferralId: string,
    username: string,
  ) {
    const selection: Selection =
      data.additionalInformation === 'Yes' ? { selected: 'Yes', value: data.details } : { selected: 'No' }
    return this.communitySupportApiClient.submitAdditionalInformationForDeliveryPartner(
      selection,
      draftReferralId,
      username,
    )
  }

  async withdrawReferral(caseReference: string, request: WithdrawReferralRequest, username: string): Promise<void> {
    await this.communitySupportApiClient.withdrawReferral(caseReference, request, username)
  }

  moveNeed(caseReference: string, request: ActionPlanNeedsOrderRequest, username: string) {
    return this.communitySupportApiClient.moveNeed(caseReference, request, username)
  }
}
