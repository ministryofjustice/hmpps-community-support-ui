import { dataAccess } from '../data'
import AuditService from './auditService'
import PersonService from './personService'
import CommunityServiceProviderService from './communityServiceProviderService'
import ReferralService from './referralService'
import CaseListService from './caseListService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, communitySupportApiClient } = dataAccess()

  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClient),
    personService: new PersonService(communitySupportApiClient),
    referralService: new ReferralService(communitySupportApiClient),
    communityServiceProviderService: new CommunityServiceProviderService(communitySupportApiClient),
    caseListService: new CaseListService(communitySupportApiClient),
  }
}

export type Services = ReturnType<typeof services>
