import {
  CreateAppointmentRequest,
  AppointmentIcsResponse,
  CreateAppointmentReferenceDataBffDto,
  IcsFeedbackSubmission,
  IcsFeedbackSubmissionResponse,
  ChangeAppointmentDetails,
  IcsFeedbackIdentifiedAdditionalSupportNeedsBffResponseDto,
} from '@community-support-api'
import CommunitySupportApiClient from '../data/communitySupportApiClient'

export default class AppointmentService {
  constructor(private communitySupportApiClient: CommunitySupportApiClient) {}

  getCreateAppointmentReferenceData(
    caseReference: string,
    username: string,
  ): Promise<CreateAppointmentReferenceDataBffDto> {
    return this.communitySupportApiClient.getCreateAppointmentReferenceData(caseReference, username)
  }

  submitICS(
    caseRefId: string,
    createAppointmentRequest: CreateAppointmentRequest,
    username: string,
  ): Promise<AppointmentIcsResponse> {
    return this.communitySupportApiClient.submitICS(caseRefId, createAppointmentRequest, username)
  }

  submitAppointment(
    caseRefId: string,
    createAppointmentRequest: CreateAppointmentRequest,
    username: string,
  ): Promise<AppointmentIcsResponse> {
    return this.communitySupportApiClient.submitAppointment(caseRefId, createAppointmentRequest, username)
  }

  getIcsById(referralId: string, icsId: string, username: string): Promise<AppointmentIcsResponse> {
    return this.communitySupportApiClient.getIcsById(referralId, icsId, username)
  }

  submitIcsFeedback(
    caseRefId: string,
    icsId: string,
    icsFeedback: IcsFeedbackSubmission,
    username: string,
  ): Promise<IcsFeedbackSubmissionResponse> {
    return this.communitySupportApiClient.submitIcsFeedback(caseRefId, icsId, icsFeedback, username)
  }

  submitRescheduleICS(
    caseRefId: string,
    createAppointmentRequest: CreateAppointmentRequest,
    changeAppointmentDetails: ChangeAppointmentDetails,
    username: string,
  ): Promise<AppointmentIcsResponse> {
    const rescheduleAppointmentRequest = {
      ...createAppointmentRequest,
      changeAppointmentDetails,
    }
    return this.communitySupportApiClient.submitRescheduleICS(caseRefId, rescheduleAppointmentRequest, username)
  }

  getIcsSessionFeedback(icsFeedbackId: string, username: string): Promise<IcsFeedbackSubmissionResponse> {
    return this.communitySupportApiClient.getIcsSessionFeedback(icsFeedbackId, username)
  }

  getExistingSupportNeeds(
    caseRefId: string,
    username: string,
  ): Promise<IcsFeedbackIdentifiedAdditionalSupportNeedsBffResponseDto> {
    return this.communitySupportApiClient.getExistingSupportNeeds(caseRefId, username)
  }

  getIcsFeedbackWhyDidSessionNotHappen(caseRefId: string, username: string) {
    return this.communitySupportApiClient.getIcsFeedbackWhyDidSessionNotHappen(caseRefId, username)
  }

  getIcsFeedbackSessionFeedback(caseRefId: string, username: string) {
    return this.communitySupportApiClient.getIcsFeedbackSessionFeedback(caseRefId, username)
  }

  getIcsFeedbackNextSteps(caseRefId: string, username: string) {
    return this.communitySupportApiClient.getIcsFeedbackNextSteps(caseRefId, username)
  }

  getIcsFeedbackIssuesOrConcerns(caseRefId: string, username: string) {
    return this.communitySupportApiClient.getIcsFeedbackIssuesOrConcerns(caseRefId, username)
  }

  getIcsFeedbackIdentifiedAdditionalNeeds(caseRefId: string, username: string) {
    return this.communitySupportApiClient.getIcsFeedbackIdentifiedAdditionalNeeds(caseRefId, username)
  }

  getIcsFeedbackHowTheyTriedToContactThePerson(caseRefId: string, username: string) {
    return this.communitySupportApiClient.getIcsFeedbackHowTheyTriedToContactThePerson(caseRefId, username)
  }

  getIcsFeedbackDidSessionTakePlace(caseRefId: string, username: string) {
    return this.communitySupportApiClient.getIcsFeedbackDidSessionTakePlace(caseRefId, username)
  }

  getIcsFeedbackCheckAnswers(caseRefId: string, username: string) {
    return this.communitySupportApiClient.getIcsFeedbackCheckAnswers(caseRefId, username)
  }

  getIcsFeedbackAttendance(caseRefId: string, username: string) {
    return this.communitySupportApiClient.getIcsFeedbackAttendance(caseRefId, username)
  }

  getIcsFeedbackSessionDetails(caseRefId: string, username: string) {
    return this.communitySupportApiClient.getIcsFeedbackSessionDetails(caseRefId, username)
  }

  getIcsViewOrChange(caseRefId: string, username: string) {
    return this.communitySupportApiClient.getIcsViewOrChange(caseRefId, username)
  }

  getIcsChangeDetails(caseRefId: string, username: string) {
    return this.communitySupportApiClient.getIcsChangeDetails(caseRefId, username)
  }

  getIcsChangeReason(caseRefId: string, username: string) {
    return this.communitySupportApiClient.getIcsChangeReason(caseRefId, username)
  }
}
