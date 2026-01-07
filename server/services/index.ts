import { dataAccess } from '../data'
import AuditService from './auditService'
import PersonService from './personService'
import CommunitySupportService from './referralService'
import ReferralService from './referralService'
import CommunityServiceProviderService from './communityServiceProviderService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, communitySupportApiClient } = dataAccess()

  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClient),
    communitySupportService: new CommunitySupportService(communitySupportApiClient),
    personService: new PersonService(communitySupportApiClient),
    referralService: new ReferralService(communitySupportApiClient),
    communityServiceProviderService: new CommunityServiceProviderService(communitySupportApiClient),
  }
}

export type Services = ReturnType<typeof services>
