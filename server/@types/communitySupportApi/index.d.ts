import type { components } from './imported'

type Referral = components['schemas']['ReferralDto']
type CommunitySupportServicesProvider = components['schemas']['CommunitySupportServicesDto']
type CommunitySupportServiceProviders = components['schemas']['CommunitySupportServiceDto']
type Person = components['schemas']['PersonDto']
type CreateReferralRequest = components['schemas']['CreateReferralRequest']
type CreateAppointmentRequest = components['schemas']['CreateAppointmentRequest']
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
type AppointmentTime = components['schemas']['AppointmentTimeRequest']
type ReferralProgress = components['schemas']['ReferralProgressDto']
type ReferralAppointmentHistory = components['schemas']['ReferralAppointmentHistoryDto']
type ProbationOffice = components['schemas']['ProbationOffice']

export type {
  Referral,
  CommunitySupportServicesProvider,
  CommunitySupportServiceProviders,
  Person,
  CreateReferralRequest,
  CreateAppointmentRequest,
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
  AppointmentTime,
  ReferralProgress,
  ReferralAppointmentHistory,
  ProbationOffice,
}
