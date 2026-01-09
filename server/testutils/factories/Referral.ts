import { Referral } from '@community-support-api'
import { Factory } from 'fishery'

class ReferralFactory extends Factory<Referral> {}

export default ReferralFactory.define(({ sequence }) => ({
  id: `referral-id-${sequence}`,
  crn: `CRN${sequence}`,
  referenceNumber: sequence.toString().padStart(8, 'ABC'),
  firstName: 'John',
  lastName: 'Doe',
}))
