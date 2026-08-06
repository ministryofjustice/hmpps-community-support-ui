import { Person, type ReferralInformation } from '@community-support-api'
import { PersonNeeds } from '../personNeeds/buildPersonNeedsRequest'

export default interface ReferralCreationDetails {
  personDetails: Person
  referralInformation: ReferralInformation
  personNeeds?: PersonNeeds
}
