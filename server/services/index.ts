import { dataAccess } from '../data'
import AuditService from './auditService'
import PersonService from './personService'
import ReferralService from './referralService'
import ReferenceDataService from './referenceDataService'
import CommunityServiceProviderService from './communityServiceProviderService'
import CaseListService from './caseListService'
import AppointmentService from './AppointmentService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, communitySupportApiClient, prisonApiClient } = dataAccess()

  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClient),
    personService: new PersonService(communitySupportApiClient),
    referralService: new ReferralService(communitySupportApiClient),
    communityServiceProviderService: new CommunityServiceProviderService(communitySupportApiClient),
    caseListService: new CaseListService(communitySupportApiClient),
    appointmentService: new AppointmentService(communitySupportApiClient),
    referenceDataService: new ReferenceDataService(communitySupportApiClient, prisonApiClient),
  }
}

export type Services = ReturnType<typeof services>
