import { Person, type ReferralInformation } from '@community-support-api'

export default interface ReferralCreationDetails {
  personDetails: Person
  referralInformation: ReferralInformation
}
