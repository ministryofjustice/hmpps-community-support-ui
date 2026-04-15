import type { ReferralDetailsResponseDto } from '@community-support-api'

const mockReferralId = crypto.randomUUID()

const referralInformationInCommunity: ReferralDetailsResponseDto = {
  id: mockReferralId,
  referenceNumber: 'R20260327',
  createdDate: '2026-03-27',
  personDetailsTableData: {
    name: 'John Doe',
    crn: 'A123456',
    dateOfBirth: '1990-05-15',
    preferredLanguage: 'English',
    disabilities: '',
  },
  equalityDetailsTableData: {
    ethnicity: '',
    religionOrBelief: '',
    sex: '',
    genderIdentity: '',
    sexualOrientation: '',
    transgender: '',
  },
  contactDetailsTableData: {
    phoneNumber: '',
    mobileNumber: '',
    email: '',
    address: '',
  },
  referralDetailsTableData: {
    referralDate: '',
    assignedTo: [],
  },
}

const referralInformationInPrison: ReferralDetailsResponseDto = {
  id: mockReferralId,
  referenceNumber: 'R20260327',
  createdDate: '2026-03-27T10:00:00Z',
  personDetailsTableData: {
    name: 'John Doe',
    crn: 'A123456',
    dateOfBirth: '1990-05-15',
    preferredLanguage: 'English',
    disabilities: '',
  },
  equalityDetailsTableData: {
    ethnicity: '',
    religionOrBelief: '',
    sex: '',
    genderIdentity: '',
    sexualOrientation: '',
    transgender: '',
  },
  contactDetailsTableData: {
    phoneNumber: '',
    mobileNumber: '',
    email: '',
    address: '',
  },
  referralDetailsTableData: {
    referralDate: '',
    assignedTo: [],
  },
}

export { referralInformationInCommunity, referralInformationInPrison }
