import { Response } from 'express'
import { Person, AreaConfirmationBffResponseDto } from '@community-support-api'
import ConfirmAnAreaForReferralPresenter from './ConfirmAnAreaForReferralPresenter'

describe('ConfirmAnAreaForReferralPresenter', () => {
  const providerDetails: AreaConfirmationBffResponseDto = {
    deliveryPartner: 'Ingeus UK Limited',
    contractArea: 'Avon and Somerset, Gloucestershire, Wiltshire.',
    associatedPdus: ['Bath and North Somerset', 'Bristol and South Gloucestershire', 'Gloucestershire'],
    crn: 'X123456',
    dateOfBirth: '1975-02-20',
  }

  const personDetails = {
    id: 'person-uuid-1',
    firstName: 'Alex',
    middleNames: '',
    lastName: 'River',
    personIdentifier: 'X123456',
    dateOfBirth: '20 Feb 1975 (51 years old)',
    prisonNumbers: [],
  } as unknown as Person

  const res = {
    locals: {
      content: {
        backLink: '/referral/task-list',
        pageCaption: 'CRN: {{ CRN }} | Date of birth: {{ DOB }}',
        defaultFieldValue: 'Not available',
        cardHeading: 'Start a Community Support referral',
        deliveryPartnerLabel: 'Delivery partner',
        areaCoveredLabel: 'Area covered',
        pdusLabel: 'PDUs in this area',
        buttonText: 'Save and continue',
        selectDifferentAreaText: 'Select a different area',
        selectDifferentAreaHref: '/referral/task-list/select-an-area-for-referral',
      },
    },
  } as unknown as Response

  test('builds correct view model', () => {
    const presenter = new ConfirmAnAreaForReferralPresenter(providerDetails, personDetails)
    const viewModel = presenter.buildViewModel(res)

    expect(viewModel.backLink.href).toBe('/referral/task-list')
    expect(viewModel.heading).toBe('Alex River')
    expect(viewModel.pageCaption).toBe('CRN: X123456 | Date of birth: 20 Feb 1975 (51 years old)')
    expect(viewModel.submitHref).toBe('/referral/task-list/confirm-an-area-for-referral')

    expect(viewModel.card).toEqual({
      heading: 'Start a Community Support referral',
      primaryAction: { text: 'Save and continue' },
      secondaryAction: {
        text: 'Select a different area',
        href: '/referral/task-list/select-an-area-for-referral',
        style: 'link',
      },
    })

    expect(viewModel.deliveryPartner).toBe('Ingeus UK Limited')
    expect(viewModel.areaCovered).toBe('Avon and Somerset, Gloucestershire, Wiltshire.')
    expect(viewModel.pdus).toEqual(['Bath and North Somerset', 'Bristol and South Gloucestershire', 'Gloucestershire'])
  })

  test('falls back to default values when provider fields are missing', () => {
    const presenter = new ConfirmAnAreaForReferralPresenter(
      { deliveryPartner: '', contractArea: '', associatedPdus: undefined, crn: 'X123456', dateOfBirth: '1975-02-20' },
      personDetails,
    )

    const viewModel = presenter.buildViewModel(res)

    expect(viewModel.deliveryPartner).toBe('Not available')
    expect(viewModel.areaCovered).toBe('Not available')
    expect(viewModel.pdus).toEqual([])
  })

  test('falls back to default values when person identifier or date of birth are missing', () => {
    const presenter = new ConfirmAnAreaForReferralPresenter(providerDetails, {
      ...personDetails,
      personIdentifier: null,
      dateOfBirth: '',
    } as unknown as Person)

    const viewModel = presenter.buildViewModel(res)

    expect(viewModel.pageCaption).toBe('CRN: Not available | Date of birth: Not available')
  })
})
