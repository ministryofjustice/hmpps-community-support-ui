import { dataAccess } from '../data'
import AuditService from './auditService'
import CommunitySupportService from './referralService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, communitySupportApiClient } = dataAccess()

  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClient),
    communitySupportService: new CommunitySupportService(communitySupportApiClient),
  }
}

export type Services = ReturnType<typeof services>
