import { ApiConfig, RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import type {
  CommunitySupportServicesProvider,
  Referral,
  Person,
  CreateReferralRequest,
  ReferralInformation,
  SubmitReferralResponse,
  CaseList,
  PagedRequest,
  ReferralUserAssignmentsRequest,
  ReferralUserAssignmentsResponse,
  CaseWorkerDto,
  ReferralDetailsResponseDto,
  CreateAppointmentRequest,
  AppointmentIcsResponse,
  ReferralProgress,
  ProbationOffice,
  IcsFeedbackSubmission,
  IcsFeedbackSubmissionResponse,
  ChangeAppointmentDetails,
  ConfirmPersonDetailsBffDto,
  AdditionalSupportNeedsDto,
  TaskListStatusDto,
  NeedsInterpreterBffResponseDto,
  CommunitySupportRiskDto,
  CommunitySupportRiskInformationDto,
  ReferralCriminogenicNeedsDto,
  CriminogenicNeedsRequest,
} from '@community-support-api'
import config from '../config'
import logger from '../../logger'
import { PagedResponse } from '../@types/communitySupportApi/derived'

export default class CommunitySupportApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient, apiConfig: ApiConfig = null) {
    super('Community Support API', apiConfig || config.apis.communitySupportService, logger, authenticationClient)
  }

  getCaseDetailsById(referralId: string, username: string): Promise<ReferralDetailsResponseDto> {
    return this.get({ path: `/bff/referral-details-page/${referralId}` }, asSystem(username))
  }

  async getReferralById(referralId: string, username: string): Promise<Referral> {
    return this.get({ path: `/bff/referral-details/${referralId}` }, asSystem(username))
  }

  async getCommunitySupportServiceProviders(
    personDetailsId: string,
    username: string,
  ): Promise<CommunitySupportServicesProvider> {
    return this.get({ path: `/bff/referral-select-a-service?personDetailsId=${personDetailsId}` }, asSystem(username))
  }

  async getPersonDetailsForPersonSearch(personIdentifier: string, username: string): Promise<Person> {
    return this.get({ path: `/bff/person/${personIdentifier}` }, asSystem(username))
  }

  async createReferral(referralData: CreateReferralRequest, username: string): Promise<ReferralInformation> {
    return this.post({ path: '/referral', data: referralData }, asSystem(username))
  }

  async submitReferralById(referralId: string, username: string): Promise<SubmitReferralResponse> {
    return this.post({ path: `/${referralId}/submit-a-referral` }, asSystem(username))
  }

  async getCaseList(username: string, page: PagedRequest, assigned: boolean = false): Promise<PagedResponse<CaseList>> {
    return this.get(
      { path: `/bff/case-list/${!assigned ? 'unassigned' : 'in-progress'}?page=${page.page}&size=${page.size}` },
      asSystem(username),
    )
  }

  async getReferralUserAssignments(referralId: string, username: string): Promise<CaseWorkerDto[]> {
    return this.get({ path: `/bff/referral-assignments/${referralId}` }, asSystem(username))
  }

  async submitReferralUserAssignments(
    referralId: string,
    assignmentsData: ReferralUserAssignmentsRequest,
    username: string,
  ): Promise<ReferralUserAssignmentsResponse> {
    return this.post({ path: `/referral/${referralId}/assign`, data: assignmentsData }, asSystem(username))
  }

  async getProbationOffices(username: string): Promise<ProbationOffice[]> {
    return this.get({ path: `/bff/reference-data/probation-offices` }, asSystem(username))
  }

  getICS(caseRefId: string, username: string): Promise<AppointmentIcsResponse> {
    return this.get({ path: `/bff/referral-details/${caseRefId}/ics` }, asSystem(username))
  }

  async submitICS(
    caseRefId: string,
    createAppointmentRequest: CreateAppointmentRequest,
    username: string,
  ): Promise<AppointmentIcsResponse> {
    return this.post({ path: `/referral/${caseRefId}/ics`, data: createAppointmentRequest }, asSystem(username))
  }

  getReferralProgress(caseReference: string, username: string): Promise<ReferralProgress> {
    return this.get({ path: `/bff/referral-details/${caseReference}/progress` }, asSystem(username))
  }

  getReferralInformation(caseReference: string, username: string): Promise<ReferralInformation> {
    return this.get({ path: `/bff/referral-information/${caseReference}` }, asSystem(username))
  }

  getIcsById(referralId: string, icsId: string, username: string): Promise<AppointmentIcsResponse> {
    return this.get({ path: `/bff/referral/${referralId}/ics/${icsId}` }, asSystem(username))
  }

  async submitIcsFeedback(
    caseRefId: string,
    icsId: string,
    icsFeedback: IcsFeedbackSubmission,
    username: string,
  ): Promise<IcsFeedbackSubmissionResponse> {
    return this.post({ path: `/referral/${caseRefId}/ics/${icsId}/feedback`, data: icsFeedback }, asSystem(username))
  }

  submitRescheduleICS(
    caseRefId: string,
    rescheduleAppointmentRequest: CreateAppointmentRequest & ChangeAppointmentDetails,
    username: string,
  ): Promise<AppointmentIcsResponse> {
    return this.put({ path: `/referral/${caseRefId}/ics`, data: rescheduleAppointmentRequest }, asSystem(username))
  }

  getIcsSessionFeedback(icsFeedbackId: string, username: string): Promise<IcsFeedbackSubmissionResponse> {
    return this.get({ path: `/bff/ics-feedback/${icsFeedbackId}` }, asSystem(username))
  }

  getPersonalDetails(referralId: string, username: string): Promise<ConfirmPersonDetailsBffDto> {
    return this.get({ path: `/bff/confirm-person-details/${referralId}` }, asSystem(username))
  }

  getAdditionalSupportNeeds(id: string, username: string): Promise<AdditionalSupportNeedsDto> {
    return this.get({ path: `/bff/draft-referral/additional-support-needs/${id}` }, asSystem(username))
  }

  getTaskListStatus(referralId: string, username: string): Promise<TaskListStatusDto> {
    return this.get({ path: `/bff/task-list-status/${referralId}` }, asSystem(username))
  }

  getNeedsInterpreterPageData(referralId: string, username: string): Promise<NeedsInterpreterBffResponseDto> {
    return this.get({ path: `/bff/draft-referral/needs-interpreter/${referralId}` }, asSystem(username))
  }

  getRoshRisksByReferralId(referralId: string, username: string): Promise<CommunitySupportRiskDto> {
    return this.get({ path: `/bff/draft-referral/risk-information/${referralId}` }, asSystem(username))
  }

  saveRiskInformation(
    referralId: string,
    riskInformation: CommunitySupportRiskInformationDto,
    username: string,
  ): Promise<CommunitySupportRiskInformationDto> {
    return this.put(
      { path: `/draft-referral/risk-information/${referralId}`, data: riskInformation },
      asSystem(username),
    )
  }

  savePersonalDetailsConfirmed(draftReferralId: string, username: string): Promise<void> {
    return this.patch({ path: `/draft-referral/confirm-person-details/${draftReferralId}` }, asSystem(username))
  }

  getPersonNeeds(draftReferralId: string, username: string): Promise<ReferralCriminogenicNeedsDto> {
    return this.get({ path: `/bff/draft-referral/person-needs/${draftReferralId}` }, asSystem(username))
  }

  savePersonNeeds(
    draftReferralId: string,
    personNeeds: CriminogenicNeedsRequest,
    username: string,
  ): Promise<ReferralCriminogenicNeedsDto> {
    return this.patch(
      { path: `/draft-referral/person-needs/${draftReferralId}`, data: personNeeds },
      asSystem(username),
    )
  }
}
