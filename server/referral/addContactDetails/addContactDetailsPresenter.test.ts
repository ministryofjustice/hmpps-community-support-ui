import { Response } from 'express'
import { GovukFrontendErrorSummaryErrorListElement } from '@govuk-frontend'
import { Person, ProbationOffice } from '@community-support-api'
import AddContactDetailsPresenter from './addContactDetailsPresenter'
import { ErrorMiddlewareErrors } from '../../@types/express'

const personalDetails: Person = {
  firstName: 'Alex',
  lastName: 'River',
  personIdentifier: 'X123456',
  prisonNumbers: ['A1234BC'],
  sex: 'Male',
  id: 'ID123',
  dateOfBirth: '20 Feb 1975 (51 years old)',
}

const probationOffices: ProbationOffice[] = [
  {
    probationOfficeId: 1,
    name: 'London Probation Office',
    address: 'Address 1',
    probationRegionId: '1',
  },
  {
    probationOfficeId: 2,
    name: 'Manchester Probation Office',
    address: 'Address 2',
    probationRegionId: '2',
  },
]

const content = {
  buttonText: 'Save and continue',
  backLinkText: 'Back',
  backLinkHref: '/referral/task-list',
  heading: 'Add contact details for {{ personName }}',
  pageCaption: 'CRN: {{ CRN }} | Date of birth: {{ DOB }}',
  subHeading: 'Contact information',
  nameInputLabel: 'Name',
  emailAddressInputLabel: 'Email address',
  jobRoleInputLabel: 'Job role',
  phoneNumberInputLabel: 'Phone number',
  pduInputLabel: 'PDU',
  probationOfficeInputLabel: 'Probation office',
  teamPhoneNumberInputLabel: 'Team phone number',
  hintText: 'Select an option',
  insetText: 'This information will be used to contact the probation team',
}

const res = {
  locals: { content },
} as unknown as Response

const validationErrors = {
  list: <GovukFrontendErrorSummaryErrorListElement[]>[
    { href: '#name', text: 'Enter a name' },
    { href: '#email', text: 'Enter an email address' },
  ],
  messages: {
    name: { text: 'Enter a name' },
    email: { text: 'Enter an email address' },
  },
}

describe('AddContactDetailsPresenter', () => {
  describe('heading and pageCaption', () => {
    it('builds heading from person name', () => {
      const presenter = new AddContactDetailsPresenter(personalDetails, probationOffices)
      const viewModel = presenter.buildViewModel(res)
      expect(viewModel.heading).toBe('Add contact details for Alex River')
    })

    it('builds pageCaption from CRN and date of birth', () => {
      const presenter = new AddContactDetailsPresenter(personalDetails, probationOffices)
      const viewModel = presenter.buildViewModel(res)
      expect(viewModel.pageCaption).toBe('CRN: X123456 | Date of birth: 20 Feb 1975 (51 years old)')
    })
  })

  describe('back link', () => {
    it('builds back link from content', () => {
      const presenter = new AddContactDetailsPresenter(personalDetails, probationOffices)
      const viewModel = presenter.buildViewModel(res)
      expect(viewModel.backLinkArgs).toEqual({ text: 'Back', href: '/referral/task-list' })
    })
  })

  describe('button', () => {
    it('builds button with preventDoubleClick enabled', () => {
      const presenter = new AddContactDetailsPresenter(personalDetails, probationOffices)
      const viewModel = presenter.buildViewModel(res)
      expect(viewModel.buttonArgs).toEqual({ text: 'Save and continue', preventDoubleClick: true })
    })
  })

  describe('probation office options', () => {
    it('generates select items with empty first option', () => {
      const presenter = new AddContactDetailsPresenter(personalDetails, probationOffices)
      const options = presenter.generateProbationOfficeOptions()
      expect(options).toHaveLength(3)
      expect(options[0]).toEqual({ text: '', value: '' })
    })

    it('maps probation offices to select items', () => {
      const presenter = new AddContactDetailsPresenter(personalDetails, probationOffices)
      const options = presenter.generateProbationOfficeOptions()
      expect(options[1]).toEqual({ text: 'London Probation Office', value: '1' })
      expect(options[2]).toEqual({ text: 'Manchester Probation Office', value: '2' })
    })
  })

  describe('input args generation', () => {
    it('generates input args with correct structure', () => {
      const presenter = new AddContactDetailsPresenter(personalDetails, probationOffices)
      const inputArgs = presenter.generateInputArgs('Name', 'name')
      expect(inputArgs).toMatchObject({
        label: {
          text: 'Name',
          classes: 'govuk-label--m ',
          isPageHeading: false,
        },
        id: 'name',
        name: 'name',
        classes: 'govuk-input--width-20',
        errorMessage: null,
        value: '',
      })
    })

    it('includes user input data when provided', () => {
      const userInputData = { name: 'John Doe' }
      const presenter = new AddContactDetailsPresenter(personalDetails, probationOffices, undefined, userInputData)
      const inputArgs = presenter.generateInputArgs('Name', 'name')
      expect(inputArgs.value).toBe('John Doe')
    })

    it('includes validation error when provided', () => {
      const presenter = new AddContactDetailsPresenter(personalDetails, probationOffices, validationErrors)
      const inputArgs = presenter.generateInputArgs('Name', 'name')
      expect(inputArgs.errorMessage).toEqual({ text: 'Enter a name' })
    })
  })

  describe('select args generation', () => {
    it('generates select args with correct structure', () => {
      const presenter = new AddContactDetailsPresenter(personalDetails, probationOffices)
      const items = [{ text: 'Option 1', value: '1' }]
      const selectArgs = presenter.generateSelectArgs('PDU', 'Select an option', 'pdu', items)
      expect(selectArgs).toMatchObject({
        id: 'pdu',
        name: 'pdu',
        label: {
          text: 'PDU',
          classes: 'govuk-label--m govuk-!-margin-bottom-0',
          isPageHeading: false,
        },
        hint: { text: 'Select an option' },
        items,
        errorMessage: null,
        value: '',
      })
    })

    it('includes user input data when provided', () => {
      const userInputData = { pdu: '1' }
      const items = [{ text: 'Option 1', value: '1' }]
      const presenter = new AddContactDetailsPresenter(personalDetails, probationOffices, undefined, userInputData)
      const selectArgs = presenter.generateSelectArgs('PDU', 'Select an option', 'pdu', items)
      expect(selectArgs.value).toBe('1')
    })

    it('includes validation error when provided', () => {
      const errors: ErrorMiddlewareErrors = {
        list: <GovukFrontendErrorSummaryErrorListElement[]>[],
        messages: { pdu: { text: 'Select a PDU' } },
      }
      const items = [{ text: 'Option 1', value: '1' }]
      const presenter = new AddContactDetailsPresenter(personalDetails, probationOffices, errors)
      const selectArgs = presenter.generateSelectArgs('PDU', 'Select an option', 'pdu', items)
      expect(selectArgs.errorMessage).toEqual({ text: 'Select a PDU' })
    })
  })

  describe('buildViewModel', () => {
    it('builds complete view model with all fields', () => {
      const presenter = new AddContactDetailsPresenter(personalDetails, probationOffices)
      const viewModel = presenter.buildViewModel(res)
      expect(viewModel).toHaveProperty('heading')
      expect(viewModel).toHaveProperty('pageCaption')
      expect(viewModel).toHaveProperty('backLinkArgs')
      expect(viewModel).toHaveProperty('buttonArgs')
      expect(viewModel).toHaveProperty('subHeading')
      expect(viewModel).toHaveProperty('nameInputArgs')
      expect(viewModel).toHaveProperty('emailInputArgs')
      expect(viewModel).toHaveProperty('jobRoleInputArgs')
      expect(viewModel).toHaveProperty('phoneNumberInputArgs')
      expect(viewModel).toHaveProperty('pduSelectArgs')
      expect(viewModel).toHaveProperty('probationOfficeSelectArgs')
      expect(viewModel).toHaveProperty('teamPhoneNumberInputArgs')
      expect(viewModel).toHaveProperty('insetText')
    })

    it('passes static content through to view model', () => {
      const presenter = new AddContactDetailsPresenter(personalDetails, probationOffices)
      const viewModel = presenter.buildViewModel(res)
      expect(viewModel.subHeading).toBe('Contact information')
      expect(viewModel.insetText).toBe('This information will be used to contact the probation team')
    })
  })

  describe('getTemplatePath', () => {
    it('returns the correct template path', () => {
      const presenter = new AddContactDetailsPresenter(personalDetails, probationOffices)
      expect(presenter.getTemplatePath()).toBe('referral/addContactDetails')
    })
  })
})
