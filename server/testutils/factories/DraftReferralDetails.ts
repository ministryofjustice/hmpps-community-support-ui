import { Factory } from 'fishery'

const DraftReferralDetailsFactory = new Factory(() => ({
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
  equalityDetailsTableData: {},
  additionalInformationDetailsTableData: {},
  contactDetailsTableData: {},
  riskInformationDetailsTableData: {},
  additionalSupportNeedsDetailsTableData: {},
  personNeedsDetailsTableData: {},
  referralAreaTableData: { area: '' },
  mainPocDetailsTableData: {},
}))

export default DraftReferralDetailsFactory
