import { dataAccess } from '../data'
import AuditService from './auditService'
import PersonService from './personService'
import CommunitySupportService from './referralService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, communitySupportApiClient } = dataAccess()

  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClient),
    communitySupportService: new CommunitySupportService(communitySupportApiClient),
    personService: new PersonService(communitySupportApiClient),
  }
}

export type Services = ReturnType<typeof services>
