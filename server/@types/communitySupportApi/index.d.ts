import type { components } from './imported'

type Referral = components['schemas']['ReferralDto']
type CommunitySupportServicesProvider = components['schemas']['CommunitySupportServicesDto']
type CommunitySupportServiceProviders = components['schemas']['CommunitySupportServiceDto']
type Person = components['schemas']['PersonDto']
type CreateReferralRequest = components['schemas']['CreateReferralRequest']
type CreateAppointmentRequest = components['schemas']['CreateAppointmentRequest']
type ChangeAppointmentDetails = components['schemas']['ChangeAppointmentDetails']
type SessionMethodRequest = components['schemas']['SessionMethodRequest']
type ReferralInformation = components['schemas']['ReferralInformationDto']
type SubmitReferralResponse = components['schemas']['SubmitReferralResponseDto']
type CaseList = components['schemas']['ReferralCaseListDto']
type PagedRequest = components['schemas']['Pagable']
type ReferralUserAssignmentsRequest = components['schemas']['ReferralUserAssignmentsRequest']
type AssignmentFailureDto = components['schemas']['AssignmentFailureDto']
type CaseWorkerDto = components['schemas']['CaseWorkerDto']
type ReferralUserAssignmentsResponse = components['schemas']['ReferralUserAssignmentsResponse']
type ReferralUserAssignmentsDto = components['schemas']['ReferralUserAssignmentsDto']
type ReferralDetailsResponseDto = components['schemas']['ReferralDetailsBffResponseDto']
type AppointmentIcsResponse = components['schemas']['AppointmentIcsResponse']
type AppointmentTimeResponse = components['schemas']['AppointmentIcsResponse']['appointmentTime']
type ReferralProgress = components['schemas']['ReferralProgressDto']
type ReferralAppointmentHistory = components['schemas']['ReferralAppointmentHistoryDto']
type ProbationOffice = components['schemas']['ProbationOffice']
type IcsFeedbackSubmission = components['schemas']['CreateIcsFeedbackRequest']
type IcsFeedbackSubmissionResponse = components['schemas']['AppointmentIcsFeedbackResponse']
type SessionFeedbackAppointmentDetails = components['schemas']['SessionFeedbackAppointmentDetailsDto']
type SessionMethod = components['schemas']['SessionMethod']
type AppointmentDeliveryDetails = components['schemas']['AppointmentDelivery']
type CaseWorkerSummary = components['schemas']['CaseWorkerSummaryDto']

type TaskListStatusDto = components['schemas']['TaskListStatusResponseDto']
type TaskListStatusItem = components['schemas']['TaskListStatusItem']
type ConfirmPersonDetailsBffDto = components['schemas']['ConfirmPersonDetailsBffDto']
type AdditionalSupportNeedsDto = components['schemas']['AdditionalSupportNeedsBffResponseDto']
type ServiceEndDatePageDto = components['schemas']['ServiceEndDatePageDto']
type NeedsInterpreterBffResponseDto = components['schemas']['NeedsInterpreterBffResponseDto']
type Selection = components['schemas']['Selection']
type CommunitySupportRiskDto = components['schemas']['CommunitySupportRiskDto']
type ActionPlanSummaryDto = components['schemas']['ActionPlanSummaryDto']
type ArnsRiskConcernsToSelfDto = components['schemas']['ArnsRiskConcernsToSelfDto']
type ArnsRiskDto = components['schemas']['ArnsRiskDto']
type ArnsRiskRoshSummaryDto = components['schemas']['ArnsRiskRoshSummaryDto']
type CommunitySupportRiskInformationDto = components['schemas']['CommunitySupportRiskInformationDto']
type ReferralCriminogenicNeedsDto = components['schemas']['ReferralCriminogenicNeedsDto']
type CriminogenicNeedsRequest = components['schemas']['CriminogenicNeedsRequest']
type AreaConfirmationBffResponseDto = components['schemas']['AreaConfirmationBffResponseDto']
type CommunityServiceProviderRequest = components['schemas']['CommunityServiceProviderRequest']
type CommunityServiceProviderBffResponseDto = components['schemas']['CommunityServiceProviderBffResponseDto']

export type {
  Referral,
  CommunitySupportServicesProvider,
  CommunitySupportServiceProviders,
  Person,
  CreateReferralRequest,
  CreateAppointmentRequest,
  ChangeAppointmentDetails,
  SessionMethodRequest,
  ReferralInformation,
  SubmitReferralResponse,
  CaseList,
  PagedRequest,
  ReferralUserAssignmentsRequest,
  ReferralUserAssignmentsResponse,
  ReferralUserAssignmentsDto,
  AssignmentFailureDto,
  CaseWorkerDto,
  ReferralDetailsResponseDto,
  AppointmentIcsResponse,
  AppointmentTimeResponse,
  ReferralProgress,
  ReferralAppointmentHistory,
  ProbationOffice,
  IcsFeedbackSubmission,
  IcsFeedbackSubmissionResponse,
  SessionFeedbackAppointmentDetails,
  AppointmentDeliveryDetails,
  SessionMethod,
  CaseWorkerSummary,
  TaskListStatusDto,
  TaskListStatusItem,
  ConfirmPersonDetailsBffDto,
  AdditionalSupportNeedsDto,
  ServiceEndDatePageDto,
  NeedsInterpreterBffResponseDto,
  Selection,
  CommunitySupportRiskDto,
  ActionPlanSummaryDto,
  ArnsRiskConcernsToSelfDto,
  ArnsRiskDto,
  ArnsRiskRoshSummaryDto,
  CommunitySupportRiskInformationDto,
  ReferralCriminogenicNeedsDto,
  CriminogenicNeedsRequest,
  AreaConfirmationBffResponseDto,
  CommunityServiceProviderRequest,
  CommunityServiceProviderBffResponseDto,
}
