import { CreateAppointmentRequest, AppointmentIcsResponse, IcsFeedbackSubmission, IcsFeedbackSubmissionResponse } from '@community-support-api'
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

  submitIcsFeedback(
    caseRefId: string,
    icsId: string,
    icsFeedback: IcsFeedbackSubmission,
    username: string,
  ): Promise<IcsFeedbackSubmissionResponse> {
    return this.communitySupportApiClient.submitIcsFeedback(caseRefId, icsId, icsFeedback, username)
  }
}
