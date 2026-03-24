import { Response } from 'express'
import { ReferralDetailsResponseDto } from '@community-support-api'
import ReferralDetailsPresenter, { ReferralDetailsViewModel } from './ReferralDetailsPresenter'
import ReferralDetailsContent from '../../testutils/factories/ReferralDetailsContent'

describe('ReferralDetailsPresenter', () => {
  let dto: ReferralDetailsResponseDto | null = null
  let expected: ReferralDetailsViewModel | null = null
  const today = new Date('2026-02-09T11:23:00.780Z')
  jest.useFakeTimers().setSystemTime(today)
  beforeEach(() => {
    dto = {
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
        assignedTo: ['assigned1', 'assigned2'],
      },
    }
    expected = {
      name: 'John Doe',
      backLink: { href: '/unassigned-cases' },
      successBanner: null,
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
                  text: 'Change',
                  href: '/referral/id-1/assign',
                },
              ],
            },
          },
        ],
      },
    }
  })
  test('rendering', () => {
    const presenter = new ReferralDetailsPresenter(dto, null)
    const content = ReferralDetailsContent.build()
    const response = { locals: { content } } as unknown as Response
    const pageContent = presenter.buildPageContent(response)
    expect(pageContent).toStrictEqual(expected)
  })
  test('default values', () => {
    dto.contactDetailsTableData.phoneNumber = ''
    dto.contactDetailsTableData.mobileNumber = ' '
    dto.contactDetailsTableData.email = null
    dto.contactDetailsTableData.address = undefined
    dto.referralDetailsTableData.assignedTo = []

    const presenter = new ReferralDetailsPresenter(dto, null)
    const content = ReferralDetailsContent.build()
    const response = { locals: { content } } as unknown as Response
    const pageContent = presenter.buildPageContent(response)

    expected.referral.rows[1].value.text = 'Unassigned'
    expected.contact.rows[0].value.text = 'Not available'
    expected.contact.rows[1].value.text = 'Not available'
    expected.contact.rows[2].value.text = 'Not available'
    expected.contact.rows[3].value.text = 'Not available'
    expected.referral.rows[1].actions.items[0].text = 'Assign to caseworker'
    expect(pageContent).toStrictEqual(expected)
  })
  test('default assign to value', () => {
    dto.contactDetailsTableData.phoneNumber = ''
    dto.contactDetailsTableData.mobileNumber = ' '
    dto.contactDetailsTableData.email = null
    dto.contactDetailsTableData.address = undefined
    dto.referralDetailsTableData.assignedTo = null

    const presenter = new ReferralDetailsPresenter(dto, null)
    const content = ReferralDetailsContent.build()
    const response = { locals: { content } } as unknown as Response
    const pageContent = presenter.buildPageContent(response)
    expected.referral.rows[1].value.text = 'Unassigned'
    expected.contact.rows[0].value.text = 'Not available'
    expected.contact.rows[1].value.text = 'Not available'
    expected.contact.rows[2].value.text = 'Not available'
    expected.contact.rows[3].value.text = 'Not available'
    expected.referral.rows[1].actions.items[0].text = 'Assign to caseworker'
    expect(pageContent).toStrictEqual(expected)
  })
})
