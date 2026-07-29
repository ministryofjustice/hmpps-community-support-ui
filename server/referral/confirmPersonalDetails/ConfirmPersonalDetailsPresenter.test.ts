import { Response } from 'express'
import { ConfirmPersonDetailsBffDto } from '@community-support-api'
import ConfirmPersonalDetailsPresenter from './ConfirmPersonalDetailsPresenter'

jest.useFakeTimers().setSystemTime(new Date('2026-07-03'))

const singleLineHtml = (str: string) => str.replaceAll(/>\s+/g, '>').replaceAll(/\s+</g, '<')

describe('ConfirmPersonalDetailsPresenter', () => {
  const data: ConfirmPersonDetailsBffDto = {
    id: 'do not care, never used',
    personalDetails: {
      firstName: 'Charlie',
      middleNames: 'Robert',
      lastName: 'Smith',
      crn: 'A1234CD',
      prisonNumbers: ['123456', '2468'],
      dateOfBirth: '1945-02-04',
      preferredLanguage: 'English',
      currentCircumstances: {
        updatedAt: '2026-02-04',
        value: 'current circumstances',
      },
      disabilities: {
        updatedAt: '2026-02-03',
        allDisabilities: 'Dyslexia, Something else',
      },
    },
    equalityMonitoring: {
      nationalities: ['British', 'French'],
      ethnicity: 'White European',
      religionOrBelief: 'Christian',
      sex: 'Male',
      genderIdentity: 'Male',
      sexualOrientation: 'Hetrosexual',
      transgender: 'No',
    },
    contactDetails: {
      phoneNumber: '0123456789',
      mobileNumber: '',
      emailAddress: '',
      address: {
        updatedAt: '2026-02-02',
        value: '1 Main Street, ATown, A11 11A',
        type: 'Family',
        startAt: '2026-01-01',
        notes: 'stuff and things',
        noFixedAbode: false,
      },
    },
  }
  const res = {
    locals: {
      content: {
        pageHeader: '{{ name }}',
        pageSubHeader: 'Confirm personal details',
        backLink: '/referral/task-list',
        defaultFieldValue: 'Not available',
        personalDetailsCard: {
          heading: 'Personal details',
          nameLabel: 'Name',
          crnLabel: 'CRN',
          prisonLabel: 'Prison number',
          dobLabel: 'Date of birth',
          languageLabel: 'Preferred language',
          circumstancesLabel: 'Current circumstances',
          disabilitiesLabel: 'Disabilities',
        },
        equalityMonitoringCard: {
          heading: 'Equality monitoring',
          nationalityLabel: 'Nationality',
          ethnicityLabel: 'Ethnicity',
          religionLabel: 'Religion or belief',
          sexLabel: 'Sex',
          genderLabel: 'Gender identity',
          sexualOrientationLabel: 'Sexual orientation',
          transgenderLabel: 'Transgender',
        },
        contactDetailsCard: {
          heading: 'Contact details',
          phoneNumberLabel: 'Phone number',
          mobileNumberLabel: 'Mobile number',
          emailAddressLabel: 'Email address',
          mainAddressLabel: 'Main address',
        },
        warningText: 'If this information is out of date or incorrect, you must update the information in NOMIS',
        buttonText: 'Save and continue',
        postHref: '/referral/task-list/confirm-personal-details',
      },
    },
  } as unknown as Response

  test('builds correct view model', () => {
    const presenter = new ConfirmPersonalDetailsPresenter(data)
    const viewModel = presenter.buildViewModel(res)
    expect(viewModel.backLink.href).toBe('/referral/task-list')
    expect(viewModel.heading).toBe('Charlie Robert Smith')
    expect(viewModel.subheading).toBe('Confirm personal details')

    // check personal details
    const { personal } = viewModel
    expect(personal.card.title.text).toBe('Personal details')
    expect(personal.rows).toHaveLength(7)
    const [nameRow, crnRow, prisonRow, dobRow, languageRow, circumstancesRow, disabilitiesRow] = personal.rows
    expect(nameRow.key.text).toBe('Name')
    expect(nameRow.value.text).toBe('Charlie Robert Smith')
    expect(crnRow.key.text).toBe('CRN')
    expect(crnRow.value.text).toBe('A1234CD')
    expect(prisonRow.key.text).toBe('Prison number')
    expect(prisonRow.value.text).toBe('123456, 2468')
    expect(dobRow.key.text).toBe('Date of birth')
    expect(dobRow.value.text).toBe('4 February 1945 (81 years old)')
    expect(languageRow.key.text).toBe('Preferred language')
    expect(languageRow.value.text).toBe('English')
    expect(singleLineHtml(circumstancesRow.key.html)).toBe(
      `Current circumstances<br><span class="govuk-body-s secondary-text govuk-!-font-weight-regular" style="color: #505a5f;">Last updated 4 February 2026</span>`,
    )
    expect(circumstancesRow.value.text).toBe('current circumstances')
    expect(singleLineHtml(disabilitiesRow.key.html)).toBe(
      `Disabilities<br><span class="govuk-body-s secondary-text govuk-!-font-weight-regular" style="color: #505a5f;">Last updated 3 February 2026</span>`,
    )
    expect(disabilitiesRow.value.text).toBe('Dyslexia, Something else')

    // check equality details
    const { equality } = viewModel
    expect(equality.card.title.text).toBe('Equality monitoring')
    expect(equality.rows).toHaveLength(7)
    const [nationalityRow, ethnicityRow, religionRow, sexRow, genderRow, orientationRow, transRow] = equality.rows
    expect(nationalityRow.key.text).toBe('Nationality')
    expect(nationalityRow.value.text).toBe('British, French')
    expect(ethnicityRow.key.text).toBe('Ethnicity')
    expect(ethnicityRow.value.text).toBe('White European')
    expect(religionRow.key.text).toBe('Religion or belief')
    expect(religionRow.value.text).toBe('Christian')
    expect(sexRow.key.text).toBe('Sex')
    expect(sexRow.value.text).toBe('Male')
    expect(genderRow.key.text).toBe('Gender identity')
    expect(genderRow.value.text).toBe('Male')
    expect(orientationRow.key.text).toBe('Sexual orientation')
    expect(orientationRow.value.text).toBe('Hetrosexual')
    expect(transRow.key.text).toBe('Transgender')
    expect(transRow.value.text).toBe('No')

    // check contact details
    const { contact } = viewModel
    expect(contact.card.title.text).toBe('Contact details')
    expect(contact.rows).toHaveLength(4)
    const [phoneRow, mobileRow, emailRow, addressRow] = contact.rows
    expect(phoneRow.key.text).toBe('Phone number')
    expect(phoneRow.value.text).toBe('0123456789')
    expect(mobileRow.key.text).toBe('Mobile number')
    expect(mobileRow.value.text).toBe('Not available')
    expect(emailRow.key.text).toBe('Email address')
    expect(emailRow.value.text).toBe('Not available')
    expect(singleLineHtml(addressRow.key.html)).toBe(
      'Main address<br><span class="govuk-body-s secondary-text govuk-!-font-weight-regular" style="color: #505a5f;">Last updated 2 February 2026</span>',
    )
    expect(singleLineHtml(addressRow.value.html)).toBe(
      '1 Main Street, ATown, A11 11A<br><p class="govuk-!-margin-top-2 govuk-!-margin-bottom-0"><span class="govuk-summary-list__key govuk-!-padding-bottom-0">Type of address</span><span>Family</span></p><p class="govuk-!-margin-top-2 govuk-!-margin-bottom-0"><span class="govuk-summary-list__key govuk-!-padding-bottom-0">Start date</span><span>1 January 2026</span></p><p class="govuk-!-margin-top-2 govuk-!-margin-bottom-0"><span class="govuk-summary-list__key govuk-!-padding-bottom-0">Notes</span><span>stuff and things</span></p>',
    )

    // check warning text
    expect(viewModel.warning.text).toBe(
      'If this information is out of date or incorrect, you must update the information in NOMIS',
    )
    // check button
    expect(viewModel.button.text).toBe('Save and continue')
  })
  test('shows "No fixed abode" when address contains the no fixed abode postcode', () => {
    const presenter = new ConfirmPersonalDetailsPresenter({
      ...data,
      contactDetails: {
        ...data.contactDetails,
        address: {
          ...data.contactDetails.address,
          value: '1 Test Street, NF1 1NF',
          noFixedAbode: true,
        },
      },
    })

    const viewModel = presenter.buildViewModel(res)
    const [, , , addressRow] = viewModel.contact.rows

    expect(singleLineHtml(addressRow.key.html)).toBe(
      'Main address<br><span class="govuk-body-s secondary-text govuk-!-font-weight-regular" style="color: #505a5f;">Last updated 2 February 2026</span>',
    )

    expect(singleLineHtml(addressRow.value.html)).toBe('No fixed abode')
  })
})
