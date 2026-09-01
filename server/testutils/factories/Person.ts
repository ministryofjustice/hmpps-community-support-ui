import { Factory } from 'fishery'
import { Person } from '@community-support-api'

class PersonFactory extends Factory<Person> {}

export default PersonFactory.define(({ transientParams }) => ({
  id: transientParams.id || 'ID123',
  personIdentifier: transientParams.personIdentifier || 'X123456',
  title: transientParams.title || 'Mr',
  firstName: transientParams.firstName || 'Alex',
  middleNames: transientParams.middleNames || undefined,
  lastName: transientParams.lastName || 'River',
  dateOfBirth: transientParams.dateOfBirth || '20 Feb 1975 (51 years old)',
  sex: transientParams.sex || 'Male',
  prisonNumbers: transientParams.prisonNumbers || ['A1234BC'],
  additionalDetails: transientParams.additionalDetails || {
    ethnicity: 'White: British/English/Welsh/Scotting/Northern Irish',
    preferredLanguage: 'English',
    neurodiverseConditions: 'N/A',
    religionOrBelief: 'No religion',
    nationalities: ['Argentine', 'Brazilian'],
    interestToImmigration: false,
    address: 'Derwent Centre, 1 Stuart Street, Derby, DE1 2EQ',
    addressType: 'Main residence',
    addressTypeVerified: true,
    addressStartDate: '1 Jan 2026',
    addressNotes: 'No notes',
    noFixedAbode: false,
    phoneNumber: '01234567890',
    mobileNumber: '09876543210',
    emailAddress: 'alex.river@test.com',
    disability: true,
  },
  personDetailsAndCircumstances: transientParams.personDetailsAndCircumstances || {
    preferredLanguage: 'English',
    personalCircumstances: [
      {
        description: 'Employment',
        subDescription: 'Full Time Employed',
        updatedAt: '01/02/2020',
      },
      {
        description: 'Relationship',
        subDescription: 'Married / Civil Partnership',
        updatedAt: '01/01/2020',
      },
      {
        description: 'Dependants',
        subDescription: 'Has Dependants',
        updatedAt: '01/03/2020',
      },
    ],
    disabilities: [
      {
        type: 'NDC',
        description: 'Neurodiverse conditions',
        updatedAt: '01/04/2020',
      },
    ],
    offenderPersonalityDisorder: 'Yes',
    ofHomeOfficeInterest: true,
    homeOfficeInterestNotes: 'Claiming asylum from Iran',
  },
}))
