import type { ReferralInformation } from '@community-support-api'

const mockReferralId = crypto.randomUUID()

const referralInformationInCommunity: ReferralInformation = {
  crn: 'A123456', // crn number
  firstName: 'John',
  lastName: 'Doe',
  sex: 'Male',
  referralId: mockReferralId,
  personId: 'person-id-123',
  communityServiceProviderId: 'csp-id-123',
  communityServiceProviderName: 'Community Support Provider',
  region: 'North West',
  deliveryPartner: 'Delivery Partner Ltd',
}
const referralInformationInPrison: ReferralInformation = {
  crn: 'A1234AA', // prison number
  firstName: 'Alex',
  lastName: 'Joe',
  sex: 'Male',
  referralId: mockReferralId,
  personId: 'person-id-123',
  communityServiceProviderId: 'csp-id-123',
  communityServiceProviderName: 'Community Support Provider',
  region: 'North West',
  deliveryPartner: 'Delivery Partner Ltd',
}

export { referralInformationInCommunity, referralInformationInPrison }
