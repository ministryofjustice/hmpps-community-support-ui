import type { components } from './imported'

type Referral = components['schemas']['ReferralDto']
type CommunitySupportServicesProvider = components['schemas']['CommunitySupportServicesDto']
type CommunitySupportServiceProviders = components['schemas']['CommunitySupportServiceDto']

export type { Referral, CommunitySupportServicesProvider, CommunitySupportServiceProviders }
