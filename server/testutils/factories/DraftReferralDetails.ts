import { Factory } from 'fishery'
import type { CheckDraftReferralDetailsDto } from '@community-support-api'

const DraftReferralDetailsFactory = new Factory<CheckDraftReferralDetailsDto>(() => ({
  id: 'referralId123',
  createdDate: '2026-02-10T11:23:00.780Z',
  personDetailsTableData: {
    name: { firstName: 'John', lastName: 'Doe' },
    crn: 'X123456',
    prisonNumber: undefined,
    dateOfBirth: '1975-02-20',
    preferredLanguage: 'English',
    disabilities: [],
    personalCircumstances: [],
  },
  equalityDetailsTableData: { ethnicity: 'White British', religionOrBelief: 'None', sex: 'Male' },
  additionalInformationDetailsTableData: {},
  contactDetailsTableData: { inCustody: false },
  riskInformationDetailsTableData: {},
  additionalSupportNeedsDetailsTableData: {},
  personNeedsDetailsTableData: {},
  referralAreaTableData: { area: '' },
  mainPocDetailsTableData: {},
}))

export default DraftReferralDetailsFactory
