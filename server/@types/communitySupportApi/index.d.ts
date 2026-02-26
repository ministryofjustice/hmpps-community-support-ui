import type { components } from './imported'

type Referral = components['schemas']['ReferralDto']
type CommunitySupportServicesProvider = components['schemas']['CommunitySupportServicesDto']
type CommunitySupportServiceProviders = components['schemas']['CommunitySupportServiceDto']
type Person = components['schemas']['PersonDto']
type CreateReferralRequest = components['schemas']['CreateReferralRequest']
type ReferralInformation = components['schemas']['ReferralInformationDto']
type SubmitReferralResponse = components['schemas']['SubmitReferralResponseDto']
type CaseList = components['schemas']['ReferralCaseListDto']
type PagedRequest = components['schemas']['Pagable']

export type {
  Referral,
  CommunitySupportServicesProvider,
  CommunitySupportServiceProviders,
  Person,
  CreateReferralRequest,
  ReferralInformation,
  SubmitReferralResponse,
  CaseList,
  PagedRequest,
}
