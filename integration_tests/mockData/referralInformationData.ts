import type { ReferralInformation } from '@community-support-api'
import { randomUUID } from 'crypto'

const mockReferralId = randomUUID()

export const referralInformationInCommunity: ReferralInformation = {
  crn: 'A123456', // crn number
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
}

export const referralInformationInPrison: ReferralInformation = {
  crn: 'A1234AA', // prison number
  firstName: 'Alex',
  lastName: 'Joe',
  sex: 'Male',
  referralId: mockReferralId,
  personId: 'person-id-123',
  communityServiceProviderId: 'csp-id-123',
  communityServiceProviderName: 'Community Support Provider',
  region: 'North West',
  referenceNumber: 'AB1234CD',
  deliveryPartner: 'Delivery Partner Ltd',
}

export const referralInformationInPrisonCustom = (caseRef: string, referralId: string): ReferralInformation => ({
  crn: caseRef, // prison number
  firstName: 'Alex',
  lastName: 'Jones',
  sex: 'Male',
  referralId,
  personId: 'person-id-123',
  communityServiceProviderId: 'csp-id-123',
  communityServiceProviderName: 'Community Support Provider',
  region: 'North West',
  referenceNumber: referralId,
  deliveryPartner: 'Delivery Partner Ltd',
})
