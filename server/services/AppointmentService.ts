import {
  CreateAppointmentRequest,
  AppointmentIcsResponse,
  IcsFeedbackSubmission,
  IcsFeedbackSubmissionResponse,
  ChangeAppointmentDetails,
} from '@community-support-api'
import CommunitySupportApiClient from '../data/communitySupportApiClient'

export default class AppointmentService {
  constructor(private communitySupportApiClient: CommunitySupportApiClient) {}

  getICS(icsId: string, username: string): Promise<AppointmentIcsResponse> {
    return this.communitySupportApiClient.getICS(icsId, username)
  }

  submitICS(
    caseRefId: string,
    createAppointmentRequest: CreateAppointmentRequest,
    username: string,
  ): Promise<AppointmentIcsResponse> {
    return this.communitySupportApiClient.submitICS(caseRefId, createAppointmentRequest, username)
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
}
