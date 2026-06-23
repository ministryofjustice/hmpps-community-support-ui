import type { ReferralInformation } from '@community-support-api'
import { randomUUID } from 'crypto'

const mockReferralId = randomUUID()

const referralInformationInCommunity: ReferralInformation = {
  referralDate: '2026-06-01',
  crn: 'A123456', // crn number
  firstName: 'John',
  lastName: 'Doe',
  sex: 'Male',
  referralId: mockReferralId,
  referralDate: '2024-01-01',
  personId: 'person-id-123',
  communityServiceProviderId: 'csp-id-123',
  communityServiceProviderName: 'Community Support Provider',
  region: 'North West',
  referenceNumber: 'AB1234CD',
  deliveryPartner: 'Delivery Partner Ltd',
}
const referralInformationInPrison: ReferralInformation = {
  crn: 'A1234AA', // prison number
  firstName: 'Alex',
  lastName: 'Joe',
  sex: 'Male',
  referralId: mockReferralId,
  referralDate: '2024-01-01',
  personId: 'person-id-123',
  communityServiceProviderId: 'csp-id-123',
  communityServiceProviderName: 'Community Support Provider',
  region: 'North West',
  referenceNumber: 'AB1234CD',
  referralDate: '2026-06-01',
  deliveryPartner: 'Delivery Partner Ltd',
}

export { referralInformationInCommunity, referralInformationInPrison }
