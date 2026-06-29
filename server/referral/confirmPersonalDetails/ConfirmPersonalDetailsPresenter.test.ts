import { Response } from 'express'
import { ReferralDetailsResponseDto } from '@community-support-api'
import ConfirmPersonalDetailsPresenter from './ConfirmPersonalDetailsPresenter'
import ReferralDetailsContent from '../../testutils/factories/ReferralDetailsContent'
import { ConfirmPersonalDetailsViewModel } from './ConfirmPersonalDetailsViewModel'

describe('ConfirmPersonalDetailsPresenter', () => {
  const dto: ReferralDetailsResponseDto = {
    id: 'id-1',
    referenceNumber: 'QD0878DE',
    createdDate: '2026-02-10T11:23:00.780Z',
    personDetailsTableData: {
      name: 'John Doe',
      dateOfBirth: '1973-02-10T11:23:00.780Z',
      preferredLanguage: 'English',
      disabilities: 'None',
      crn: 'CRN123',
    },
    equalityDetailsTableData: {
      ethnicity: 'White British',
      religionOrBelief: 'Christian',
      sex: 'Male',
      genderIdentity: 'Male',
      sexualOrientation: 'Hetrosexual',
      transgender: 'No',
    },
    contactDetailsTableData: {
      phoneNumber: '01234 567 890',
      mobileNumber: '09876 543 210',
      email: 'john.doe@test.com',
      address: '10 Main Street, London, AA1 1AA',
    },
    referralDetailsTableData: {
      referralDate: '2026-05-09T11:23:00.780Z',
      assignedTo: [
        { fullName: 'assigned1', emailAddress: 'assigned1@email.com', userType: 'EXTERNAL' },
        { fullName: 'assigned2', emailAddress: 'assigned2@email.com', userType: 'EXTERNAL' },
      ],
    },
  }
  const expected: ConfirmPersonalDetailsViewModel = {
    name: 'John Doe',
    backLink: { href: '/unassigned-cases' },
    personal: {
      card: {
        title: {
          text: 'Personal details',
        },
        attributes: { 'data-testid': 'personal-details' },
      },
      rows: [
        {
          key: {
            text: 'Name',
          },
          value: {
            text: 'John Doe',
          },
          actions: null,
        },
        {
          key: {
            text: 'CRN',
          },
          value: {
            text: 'CRN123',
          },
          actions: null,
        },
        {
          key: {
            text: 'Prison number',
          },
          value: {
            text: 'prison123',
          },
          actions: null,
        },
        {
          key: {
            text: 'Date of Birth',
          },
          value: {
            text: '10 February 1973 (52 years old)',
          },
          actions: null,
        },
        {
          key: {
            text: 'Preferred language',
          },
          value: {
            text: 'English',
          },
          actions: null,
        },
        {
          key: {
            text: 'Current circumstances',
          },
          value: {
            text: 'Relationship: Married / Civil Partnership\nEmployment: Full Time Employed\nDependants: Has Dependents',
          },
          actions: null,
        },
        {
          key: {
            text: 'Disabilities',
          },
          value: {
            text: 'Neurodiverse conditions',
          },
          actions: null,
        },
      ],
    },
    equality: {
      card: {
        title: {
          text: 'Equality monitoring',
        },
        attributes: { 'data-testid': 'equality-details' },
      },
      rows: [
        {
          key: {
            text: 'Ethnicity',
          },
          value: {
            text: 'White British',
          },
          actions: null,
        },
        {
          key: {
            text: 'Religion or belief',
          },
          value: {
            text: 'Christian',
          },
          actions: null,
        },
        {
          key: {
            text: 'Sex',
          },
          value: {
            text: 'Male',
          },
          actions: null,
        },
        {
          key: {
            text: 'Gender identity',
          },
          value: {
            text: 'Male',
          },
          actions: null,
        },
        {
          key: {
            text: 'Sexual orientation',
          },
          value: {
            text: 'Hetrosexual',
          },
          actions: null,
        },
        {
          key: {
            text: 'Transgender',
          },
          value: {
            text: 'No',
          },
          actions: null,
        },
      ],
    },
    contact: {
      card: {
        title: {
          text: 'Contact details',
        },
        attributes: { 'data-testid': 'contact-details' },
      },
      rows: [
        {
          key: {
            text: 'Phone number',
          },
          value: {
            text: '01234 567 890',
          },
          actions: null,
        },
        {
          key: {
            text: 'Mobile number',
          },
          value: {
            text: '09876 543 210',
          },
          actions: null,
        },
        {
          key: {
            text: 'Email address',
          },
          value: {
            text: 'john.doe@test.com',
          },
          actions: null,
        },
        {
          key: {
            text: 'Main address',
          },
          value: {
            text: '10 Main Street, London, AA1 1AA',
          },
          actions: null,
        },
      ],
    },
  }
  const today = new Date('2026-02-09T11:23:00.780Z')
  jest.useFakeTimers().setSystemTime(today)
  test.skip('rendering', () => {
    const presenter = new ConfirmPersonalDetailsPresenter(dto)
    const content = ReferralDetailsContent.build()
    const response = { locals: { content } } as unknown as Response
    const pageContent = presenter.buildPageContent(response)

    expect(pageContent).toStrictEqual(expected)
  })
})
