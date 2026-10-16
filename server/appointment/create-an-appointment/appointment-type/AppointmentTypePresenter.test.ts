import { Response } from 'express'
import { GovukFrontendErrorSummaryErrorListElement } from '@govuk-frontend'
import AppointmentTypePresenter from './AppointmentTypePresenter'

const referralInformation = {
  personIdentifier: 'A123456',
  firstName: 'John',
  lastName: 'Doe',
  sex: 'Male',
  referralId: 'referral-id',
  referralDate: '2026-06-01',
  personId: 'person-id-123',
  communityServiceProviderId: 'csp-id-123',
  communityServiceProviderName: 'Community Support Provider',
  region: 'North West',
  referenceNumber: 'AB1234CD',
  deliveryPartner: 'Delivery Partner Ltd',
}

const appointmentTypes = [
  { name: 'Contact session', value: 'CONTACT_SESSION' },
  { name: 'Pre-release session', value: 'PRE_RELEASE_SESSION' },
  { name: 'Post-release session', value: 'POST_RELEASE_SESSION' },
  { name: 'Handover session', value: 'HANDOVER_SESSION' },
]

const content = {
  pageTitle: 'Select the appointment type',
  heading: 'Create an appointment for {{ personName }}',
  appointmentTypeLabel: 'Select the appointment type',
  buttonText: 'Save and continue',
}

const res = {
  locals: { content },
} as unknown as Response

const noErrors = {
  list: <GovukFrontendErrorSummaryErrorListElement[]>[],
  messages: {},
}

const appointmentTypeErrors = {
  list: <GovukFrontendErrorSummaryErrorListElement[]>[
    { href: '#appointmentType', text: 'Select the appointment type' },
  ],
  messages: {
    appointmentType: { text: 'Select the appointment type' },
  },
}

describe('AppointmentTypePresenter', () => {
  it('builds the heading from the referral person name', () => {
    const presenter = new AppointmentTypePresenter('AB1234CD', referralInformation, appointmentTypes)

    const viewModel = presenter.buildViewModel(res)

    expect(viewModel.heading).toBe('Create an appointment for John Doe')
  })

  it('creates radio items from appointment types in order', () => {
    const presenter = new AppointmentTypePresenter('AB1234CD', referralInformation, appointmentTypes)

    const viewModel = presenter.buildViewModel(res)

    expect(viewModel.radios.items).toEqual([
      { text: 'Contact session', value: 'CONTACT_SESSION' },
      { text: 'Pre-release session', value: 'PRE_RELEASE_SESSION' },
      { text: 'Post-release session', value: 'POST_RELEASE_SESSION' },
      { text: 'Handover session', value: 'HANDOVER_SESSION' },
    ])
  })

  it('renders appointment types exactly as returned by the BFF', () => {
    const presenter = new AppointmentTypePresenter('AB1234CD', referralInformation, [
      { name: 'Contact session', value: 'CONTACT_SESSION' },
      { name: 'Pre-release session', value: 'PRE_RELEASE_SESSION' },
      { name: 'Post-release session', value: 'POST_RELEASE_SESSION' },
      { name: 'Handover session', value: 'HANDOVER_SESSION' },
    ])

    const viewModel = presenter.buildViewModel(res)

    expect(viewModel.radios.items).toEqual([
      { text: 'Contact session', value: 'CONTACT_SESSION' },
      { text: 'Pre-release session', value: 'PRE_RELEASE_SESSION' },
      { text: 'Post-release session', value: 'POST_RELEASE_SESSION' },
      { text: 'Handover session', value: 'HANDOVER_SESSION' },
    ])
  })

  it('preselects the previously chosen appointment type', () => {
    const presenter = new AppointmentTypePresenter(
      'AB1234CD',
      referralInformation,
      appointmentTypes,
      undefined,
      'POST_RELEASE_SESSION',
    )

    const viewModel = presenter.buildViewModel(res)

    expect(viewModel.radios.value).toBe('POST_RELEASE_SESSION')
  })

  it('adds the validation error message to the radios', () => {
    const presenter = new AppointmentTypePresenter(
      'AB1234CD',
      referralInformation,
      appointmentTypes,
      appointmentTypeErrors,
    )

    const viewModel = presenter.buildViewModel(res)

    expect(viewModel.radios.errorMessage).toEqual({ text: 'Select the appointment type' })
  })

  it('does not add an error message when there are no validation errors', () => {
    const presenter = new AppointmentTypePresenter('AB1234CD', referralInformation, appointmentTypes, noErrors)

    const viewModel = presenter.buildViewModel(res)

    expect(viewModel.radios.errorMessage).toBeNull()
  })

  it('returns the correct template path', () => {
    const presenter = new AppointmentTypePresenter('AB1234CD', referralInformation, appointmentTypes)

    expect(presenter.getTemplatePath()).toBe('appointment/appointmentType')
  })
})
