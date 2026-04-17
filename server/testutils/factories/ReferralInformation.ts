import { Factory } from 'fishery'
import { ReferralInformation } from '@community-support-api'
import { randomUUID } from 'crypto'

class ReferralInformationFactory extends Factory<ReferralInformation> {}

const mockReferralId = randomUUID()

export default ReferralInformationFactory.define<ReferralInformation>(() => ({
  crn: 'A123456',
  firstName: 'John',
  lastName: 'Doe',
  sex: 'Male',
  referralId: mockReferralId,
  personId: 'person-id-123',
  communityServiceProviderId: 'csp-id-123',
  communityServiceProviderName: 'Community Support Provider',
  region: 'North West',
  referenceNumber: 'AB1234CD',
  deliveryPartner: 'Delivery Partner Ltd',
}))
