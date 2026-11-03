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
  { name: 'Contact session', value: 'contact' },
  { name: 'Initial contact session', value: 'ics' },
  { name: 'Handover session', value: 'handover' },
  { name: 'Post-release session', value: 'post-release' },
  { name: 'Pre-release session', value: 'pre-release' },
]

const content = {
  pageTitle: 'Appointment type',
  buttonText: 'Continue',
}

const res = {
  locals: { content },
} as unknown as Response

const noErrors = {
  list: <GovukFrontendErrorSummaryErrorListElement[]>[],
  messages: {},
}

const appointmentTypeErrors = {
  list: <GovukFrontendErrorSummaryErrorListElement[]>[{ href: '#appointmentType', text: 'Select an appointment type' }],
  messages: {
    appointmentType: { text: 'Select an appointment type' },
  },
}

describe('AppointmentTypePresenter', () => {
  it('builds the page without a person-specific heading', () => {
    const presenter = new AppointmentTypePresenter('AB1234CD', referralInformation, appointmentTypes)

    const viewModel = presenter.buildViewModel(res)

    expect(viewModel.heading).toBeUndefined()
  })

  it('creates radio items from appointment types in order', () => {
    const presenter = new AppointmentTypePresenter('AB1234CD', referralInformation, appointmentTypes)

    const viewModel = presenter.buildViewModel(res)

    expect(viewModel.radios.items).toEqual([
      { text: 'Contact session', value: 'contact' },
      { text: 'Initial contact session', value: 'ics' },
      { text: 'Handover session', value: 'handover' },
      { text: 'Post-release session', value: 'post-release' },
      { text: 'Pre-release session', value: 'pre-release' },
    ])
  })

  it('renders appointment types exactly as returned by the BFF', () => {
    const presenter = new AppointmentTypePresenter('AB1234CD', referralInformation, appointmentTypes)

    const viewModel = presenter.buildViewModel(res)

    expect(viewModel.radios.items).toEqual([
      { text: 'Contact session', value: 'contact' },
      { text: 'Initial contact session', value: 'ics' },
      { text: 'Handover session', value: 'handover' },
      { text: 'Post-release session', value: 'post-release' },
      { text: 'Pre-release session', value: 'pre-release' },
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

    expect(viewModel.radios.errorMessage).toEqual({ text: 'Select an appointment type' })
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
