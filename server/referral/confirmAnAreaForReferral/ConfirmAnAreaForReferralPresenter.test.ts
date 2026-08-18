import { Response } from 'express'
import { Person, AreaConfirmationBffResponseDto } from '@community-support-api'
import ConfirmAnAreaForReferralPresenter from './ConfirmAnAreaForReferralPresenter'

jest.useFakeTimers().setSystemTime(new Date('2026-07-15'))

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
    dateOfBirth: '1980-01-01',
    prisonNumbers: [],
  } as unknown as Person

  const res = {
    locals: {
      content: {
        backLink: '/referral/task-list',
        crnLabel: 'CRN',
        dateOfBirthLabel: 'Date of birth',
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
    const presenter = new ConfirmAnAreaForReferralPresenter(providerDetails, personDetails, 'provider-id-123')
    const viewModel = presenter.buildViewModel(res)

    expect(viewModel.backLink.href).toBe('/referral/task-list')
    expect(viewModel.heading).toBe('Alex River')
    expect(viewModel.crn).toBe('X123456')
    expect(viewModel.dateOfBirth).toBe('20 February 1975 (51 years old)')
    expect(viewModel.dateOfBirth).not.toContain(personDetails.dateOfBirth.slice(0, 4))
    expect(viewModel.submitHref).toBe('/referral/task-list/confirm-an-area-for-referral/provider-id-123')

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
      'provider-id-123',
    )

    const viewModel = presenter.buildViewModel(res)

    expect(viewModel.deliveryPartner).toBe('Not available')
    expect(viewModel.areaCovered).toBe('Not available')
    expect(viewModel.pdus).toEqual([])
  })
})
