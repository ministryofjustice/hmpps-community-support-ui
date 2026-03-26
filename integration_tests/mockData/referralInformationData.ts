import type { ReferralInformation } from '@community-support-api'

const referralInformationInCommunity: ReferralInformation = {
  crn: 'A123456', // crn number
  firstName: 'John',
  lastName: 'Doe',
  sex: 'Male',
  referralId: 'referral-id-1',
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
  referralId: 'referral-id-2',
  personId: 'person-id-123',
  communityServiceProviderId: 'csp-id-123',
  communityServiceProviderName: 'Community Support Provider',
  region: 'North West',
  deliveryPartner: 'Delivery Partner Ltd',
}

export { referralInformationInCommunity, referralInformationInPrison }
