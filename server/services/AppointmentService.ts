import {
  CreateAppointmentRequest,
  AppointmentIcsResponse,
  CreateAppointmentReferenceDataBffDto,
  IcsFeedbackSubmission,
  IcsFeedbackSubmissionResponse,
  ChangeAppointmentDetails,
  ExistingSupportNeedsBffResponseDto,
} from '@community-support-api'
import CommunitySupportApiClient from '../data/communitySupportApiClient'

export default class AppointmentService {
  constructor(private communitySupportApiClient: CommunitySupportApiClient) {}

  getICS(icsId: string, username: string): Promise<AppointmentIcsResponse> {
    return this.communitySupportApiClient.getICS(icsId, username)
  }

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

  getExistingSupportNeeds(caseRefId: string, username: string): Promise<ExistingSupportNeedsBffResponseDto> {
    return this.communitySupportApiClient.getExistingSupportNeeds(caseRefId, username)
  }

  getExistingSupportNeedsStub(_caseRefId: string, _username: string): ExistingSupportNeedsBffResponseDto {
    return {
      physicalHealthDetails: '',
      mentalEmotionalHealthDetails:
        'As a young age, Alex experienced anxiety through different life events and personal stories, ranging from panic attacks and health anxiety to trauma-induced stress and neurodivergence-related overwhelm',
      neurodiversityDetails:
        'As per your description, Alex experienced anxiety through different life events and personal stories, ranging from panic attacks and health anxiety to trauma-induced stress and neurodivergence-related overwhelm',
      locationTravelDetails: '',
      caringResponsibilitiesDetails: '',
      employmentResponsibilitiesDetails: '',
      diversityDetails: '',
      anythingElseDetails: '',
      interpreterLanguage: '',
      referralFirstName: 'John',
    } as ExistingSupportNeedsBffResponseDto
  }
}
