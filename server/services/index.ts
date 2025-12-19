import { dataAccess } from '../data'
import AuditService from './auditService'
import ReferralService from './referralService'
import CommunityServiceProviderService from './communityServiceProviderService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, communitySupportApiClient } = dataAccess()

  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClient),
    referralService: new ReferralService(communitySupportApiClient),
    communitySupportService: new CommunityServiceProviderService(communitySupportApiClient),
  }
}

export type Services = ReturnType<typeof services>
