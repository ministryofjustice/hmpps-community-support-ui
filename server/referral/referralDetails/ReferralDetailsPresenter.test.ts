import { Response } from 'express'
import { ReferralDetailsResponseDto } from '@community-support-api'
import ReferralDetailsPresenter from './ReferralDetailsPresenter'
import ReferralDetailsContent from '../../testutils/factories/ReferralDetailsContent'

describe('ReferralDetailsPresenter', () => {
  test('construction from dto', () => {
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
        CRN: 'CRN123',
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
        assignedTo: ['assigned1', 'assigned2'],
      },
    }
    const today = new Date('2026-02-09T11:23:00.780Z')
    jest.useFakeTimers().setSystemTime(today)
    const presenter = new ReferralDetailsPresenter(dto)
    const content = ReferralDetailsContent.build()
    const response = { locals: { content } } as unknown as Response
    const pageContent = presenter.buildPageContent(response)
    expect(pageContent).toStrictEqual({
      name: 'John Doe',
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
              text: 'Disabilities',
            },
            value: {
              text: 'None',
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
      referral: {
        card: {
          title: {
            text: 'Referral details',
          },
          attributes: { 'data-testid': 'referral-details' },
        },
        rows: [
          {
            key: {
              text: 'Referral date',
            },
            value: {
              text: '9 May 2026',
            },
            actions: null,
          },
          {
            key: {
              text: 'Assigned to',
            },
            value: {
              text: 'assigned1, assigned2',
            },
            actions: {
              items: [
                {
                  text: 'Assign to caseworker',
                  href: '/referral/id-1/assign',
                },
              ],
            },
          },
        ],
      },
    })
  })
})
