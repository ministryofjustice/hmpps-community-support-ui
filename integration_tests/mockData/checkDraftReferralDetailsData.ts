import type { CheckDraftReferralDetailsDto } from '@community-support-api'

const checkDraftReferralDetails: CheckDraftReferralDetailsDto = {
  id: 'referral-uuid-1',
  referenceNumber: 'REF123456',
  createdDate: '2026-02-10T11:23:00.780Z',
  personDetailsTableData: {
    name: { firstName: 'Alex', lastName: 'River' },
    crn: 'A123456',
    dateOfBirth: '20 Feb 1975 (51 years old)',
    preferredLanguage: 'English',
    disabilities: [{ description: 'Dyslexia', updatedAt: '2026-02-03T00:00:00Z' }],
    personalCircumstances: [
      { description: 'Employment', subDescription: 'Full-time employed', updatedAt: '2026-01-05T00:00:00Z' },
    ],
  },
  equalityDetailsTableData: {
    ethnicity: 'White British',
    religionOrBelief: 'None',
    sex: 'Male',
  },
  additionalInformationDetailsTableData: {},
  contactDetailsTableData: {},
  riskInformationDetailsTableData: {},
  additionalSupportNeedsDetailsTableData: {},
  personNeedsDetailsTableData: {},
  referralAreaTableData: { area: 'London' },
  mainPocDetailsTableData: {},
}

export default checkDraftReferralDetails
