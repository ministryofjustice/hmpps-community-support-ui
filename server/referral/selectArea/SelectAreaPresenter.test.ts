import { Response } from 'express'
import { GovukFrontendErrorSummaryErrorListElement } from '@govuk-frontend'
import SelectAreaPresenter from './SelectAreaPresenter'

const personalDetails = {
  firstName: 'Alex',
  lastName: 'River',
  personIdentifier: 'X123456',
  prisonNumbers: ['A1234BC'],
  sex: 'Male',
  id: 'ID123',
  dateOfBirth: '20 Feb 1975 (51 years old)',
}

const locations = {
  communitySupportServices: {
    Cleveland: [
      {
        id: 'service-1',
        area: 'Cleveland North',
        region: 'Cleveland',
        name: 'Community Support Service in Cleveland',
        providerName: 'Provider A',
        description: 'Description',
        pdus: ['Redcar, Cleveland and Middlesbrough', 'Stockton and Hartlepool'],
      },
    ],
    Yorkshire: [
      {
        id: 'service-2',
        area: 'Yorkshire East',
        region: 'Yorkshire',
        name: 'Community Support Service in Yorkshire',
        providerName: 'Provider B',
        description: 'Description',
        pdus: ['Humberside'],
      },
    ],
  },
}

const content = {
  areaLabel: 'Select the area you want to make a referral to',
  backLinkText: 'Back',
  backLinkHref: '/referral/task-list',
  buttonText: 'Save and continue',
}

const res = {
  locals: { content },
} as unknown as Response

const noErrors = {
  list: <GovukFrontendErrorSummaryErrorListElement[]>[],
  messages: {},
}

const selectAreaErrors = {
  list: <GovukFrontendErrorSummaryErrorListElement[]>[{ href: '#selectArea', text: 'Select an area for the referral' }],
  messages: {
    selectArea: { text: 'Select an area for the referral' },
  },
}

describe('SelectAreaPresenter', () => {
  describe('heading and pageCaption', () => {
    it('builds heading from person name', () => {
      const presenter = new SelectAreaPresenter(personalDetails, locations)
      const viewModel = presenter.buildViewModel(res)
      expect(viewModel.heading).toBe('Alex River')
    })

    it('builds pageCaption from CRN and date of birth', () => {
      const presenter = new SelectAreaPresenter(personalDetails, locations)
      const viewModel = presenter.buildViewModel(res)
      expect(viewModel.pageCaption).toBe('CRN: X123456 | Date of birth: 20 Feb 1975 (51 years old)')
    })
  })

  describe('back link', () => {
    it('builds back link from content', () => {
      const presenter = new SelectAreaPresenter(personalDetails, locations)
      const viewModel = presenter.buildViewModel(res)
      expect(viewModel.backLinkArgs).toEqual({ text: 'Back', href: '/referral/task-list' })
    })
  })

  describe('radio items', () => {
    it('generates a divider for each region', () => {
      const presenter = new SelectAreaPresenter(personalDetails, locations)
      const viewModel = presenter.buildViewModel(res)
      const dividers = viewModel.radioArgs.items.filter(item => 'divider' in item)
      expect(dividers).toHaveLength(2)
      expect(dividers[0].divider).toBe('Cleveland')
      expect(dividers[1].divider).toBe('Yorkshire')
    })

    it('generates a radio item for each area with id, text and pdus hint', () => {
      const presenter = new SelectAreaPresenter(personalDetails, locations)
      const viewModel = presenter.buildViewModel(res)
      const radioItems = viewModel.radioArgs.items.filter(item => 'value' in item && item.value !== '')
      expect(radioItems).toHaveLength(2)
      expect(radioItems[0]).toMatchObject({
        value: 'service-1',
        text: 'Cleveland North',
        hint: { text: 'Redcar, Cleveland and Middlesbrough, Stockton and Hartlepool' },
      })
      expect(radioItems[1]).toMatchObject({
        value: 'service-2',
        text: 'Yorkshire East',
        hint: { text: 'Humberside' },
      })
    })

    it('uses the areaLabel from content as the fieldset legend', () => {
      const presenter = new SelectAreaPresenter(personalDetails, locations)
      const viewModel = presenter.buildViewModel(res)
      expect(viewModel.radioArgs.fieldset.legend.text).toBe('Select the area you want to make a referral to')
    })
  })

  describe('validation errors', () => {
    it('sets no error message when there are no errors', () => {
      const presenter = new SelectAreaPresenter(personalDetails, locations, noErrors)
      const viewModel = presenter.buildViewModel(res)
      expect(viewModel.radioArgs.errorMessage).toBeNull()
    })

    it('sets the error message on the radios when selectArea has a validation error', () => {
      const presenter = new SelectAreaPresenter(personalDetails, locations, selectAreaErrors)
      const viewModel = presenter.buildViewModel(res)
      expect(viewModel.radioArgs.errorMessage).toEqual({ text: 'Select an area for the referral' })
    })
  })

  describe('getTemplatePath', () => {
    it('returns the correct template path', () => {
      const presenter = new SelectAreaPresenter(personalDetails, locations)
      expect(presenter.getTemplatePath()).toBe('referral/selectArea')
    })
  })
})
