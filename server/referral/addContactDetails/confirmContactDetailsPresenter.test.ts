import { Response } from 'express'
import { Person, UpdateProbationPractitionerDetailsRequest } from '@community-support-api'
import ConfirmContactDetailsPresenter from './confirmContactDetailsPresenter'

const personalDetails: Person = {
  firstName: 'Referral',
  lastName: 'Person',
  personIdentifier: 'X123456',
  prisonNumbers: ['A1234BC'],
  sex: 'Male',
  id: 'ID123',
  dateOfBirth: '20 Feb 1975 (51 years old)',
}

type PPDetails = UpdateProbationPractitionerDetailsRequest & {
  pduName: string
  probationOfficeName?: string
}

const ppDetails: PPDetails = {
  name: 'PP 1',
  jobRole: 'Probation Practitioner',
  emailAddress: 'pp1@example.com',
  phoneNumber: '00000 111 111',
  pduId: 'pdu-1',
  pduName: 'London PDU',
  probationOfficeId: 1,
  probationOfficeName: 'London Probation Office',
  teamPhoneNumber: '11111 222 333',
}

const content = {
  backLinkText: 'Back',
  backLinkHref: '/referral/new/add-contact-details',
  buttonText: 'Save and continue',
  heading: '{{ personName }}',
  pageCaption: 'CRN: {{ CRN }} | Date of birth: {{ DOB }}',
  subHeading: 'Check contact details',
  summaryHeading: 'Contact details',
  nameLabel: 'Name',
  emailAddressLabel: 'Email address',
  jobRoleLabel: 'Job role',
  phoneNumberLabel: 'Phone number',
  pduLabel: 'PDU',
  probationOfficeLabel: 'Probation office',
  teamPhoneNumberLabel: 'Team phone number',
  changeLabel: 'Change',
  notEnteredText: 'Not entered',
}

const res = {
  locals: { content },
} as unknown as Response

describe('ConfirmContactDetailsPresenter', () => {
  describe('heading and pageCaption', () => {
    it('builds heading from person name', () => {
      const presenter = new ConfirmContactDetailsPresenter(personalDetails, ppDetails)
      const viewModel = presenter.buildViewModel(res)
      expect(viewModel.heading).toBe('Referral Person')
    })

    it('builds pageCaption from CRN and date of birth', () => {
      const presenter = new ConfirmContactDetailsPresenter(personalDetails, ppDetails)
      const viewModel = presenter.buildViewModel(res)
      expect(viewModel.pageCaption).toBe('CRN: X123456 | Date of birth: 20 Feb 1975 (51 years old)')
    })
  })

  describe('back link', () => {
    it('builds back link from content when not from PP', () => {
      const presenter = new ConfirmContactDetailsPresenter(personalDetails, ppDetails)
      const viewModel = presenter.buildViewModel(res)
      expect(viewModel.backLinkArgs).toEqual({ text: 'Back', href: '/referral/new/add-contact-details' })
    })

    it('appends fromPP=true to the back link when isFromPP is true', () => {
      const presenter = new ConfirmContactDetailsPresenter(personalDetails, ppDetails, true)
      const viewModel = presenter.buildViewModel(res)
      expect(viewModel.backLinkArgs).toEqual({
        text: 'Back',
        href: '/referral/new/add-contact-details?fromPP=true',
      })
    })
  })

  describe('button', () => {
    it('builds button with preventDoubleClick enabled', () => {
      const presenter = new ConfirmContactDetailsPresenter(personalDetails, ppDetails)
      const viewModel = presenter.buildViewModel(res)
      expect(viewModel.buttonArgs).toEqual({ text: 'Save and continue', preventDoubleClick: true })
    })
  })

  describe('subHeading', () => {
    it('passes subHeading through from content', () => {
      const presenter = new ConfirmContactDetailsPresenter(personalDetails, ppDetails)
      const viewModel = presenter.buildViewModel(res)
      expect(viewModel.subHeading).toBe('Check contact details')
    })
  })

  describe('generateSummaryList', () => {
    it('builds the card title and change action href when not from PP', () => {
      const presenter = new ConfirmContactDetailsPresenter(personalDetails, ppDetails)
      const summaryList = presenter.generateSummaryList(content)
      expect(summaryList.card).toEqual({
        title: { text: 'Contact details' },
        actions: {
          items: [{ href: '/referral/new/add-contact-details', text: 'Change' }],
        },
      })
    })

    it('appends fromPP=true to the change action href when isFromPP is true', () => {
      const presenter = new ConfirmContactDetailsPresenter(personalDetails, ppDetails, true)
      const summaryList = presenter.generateSummaryList(content)
      expect(summaryList.card.actions.items[0].href).toBe('/referral/new/add-contact-details?fromPP=true')
    })

    it('builds rows from ppDetails values', () => {
      const presenter = new ConfirmContactDetailsPresenter(personalDetails, ppDetails)
      const summaryList = presenter.generateSummaryList(content)
      expect(summaryList.rows).toEqual([
        { key: { text: 'Name' }, value: { text: 'PP 1' } },
        { key: { text: 'Job role' }, value: { text: 'Probation Practitioner' } },
        { key: { text: 'Email address' }, value: { text: 'pp1@example.com' } },
        { key: { text: 'Phone number' }, value: { text: '00000 111 111' } },
        { key: { text: 'PDU' }, value: { text: 'London PDU' } },
        { key: { text: 'Probation office' }, value: { text: 'London Probation Office' } },
        { key: { text: 'Team phone number' }, value: { text: '11111 222 333' } },
      ])
    })

    it('uses the notEnteredText fallback for an empty job role', () => {
      const presenter = new ConfirmContactDetailsPresenter(personalDetails, { ...ppDetails, jobRole: '' })
      const summaryList = presenter.generateSummaryList(content)
      expect(summaryList.rows[1]).toEqual({ key: { text: 'Job role' }, value: { text: 'Not entered' } })
    })

    it('uses the notEnteredText fallback for an empty phone number', () => {
      const presenter = new ConfirmContactDetailsPresenter(personalDetails, { ...ppDetails, phoneNumber: '' })
      const summaryList = presenter.generateSummaryList(content)
      expect(summaryList.rows[3]).toEqual({ key: { text: 'Phone number' }, value: { text: 'Not entered' } })
    })

    it('uses the notEnteredText fallback for a missing probation office name', () => {
      const { probationOfficeName, ...ppDetailsWithoutOffice } = ppDetails
      const presenter = new ConfirmContactDetailsPresenter(personalDetails, ppDetailsWithoutOffice)
      const summaryList = presenter.generateSummaryList(content)
      expect(summaryList.rows[5]).toEqual({ key: { text: 'Probation office' }, value: { text: 'Not entered' } })
    })

    it('uses the notEnteredText fallback for an empty team phone number', () => {
      const presenter = new ConfirmContactDetailsPresenter(personalDetails, { ...ppDetails, teamPhoneNumber: '' })
      const summaryList = presenter.generateSummaryList(content)
      expect(summaryList.rows[6]).toEqual({ key: { text: 'Team phone number' }, value: { text: 'Not entered' } })
    })
  })

  describe('buildViewModel', () => {
    it('builds complete view model with all fields', () => {
      const presenter = new ConfirmContactDetailsPresenter(personalDetails, ppDetails)
      const viewModel = presenter.buildViewModel(res)
      expect(viewModel).toHaveProperty('heading')
      expect(viewModel).toHaveProperty('pageCaption')
      expect(viewModel).toHaveProperty('backLinkArgs')
      expect(viewModel).toHaveProperty('buttonArgs')
      expect(viewModel).toHaveProperty('subHeading')
      expect(viewModel).toHaveProperty('summaryListArgs')
    })
  })

  describe('getTemplatePath', () => {
    it('returns the correct template path', () => {
      const presenter = new ConfirmContactDetailsPresenter(personalDetails, ppDetails)
      expect(presenter.getTemplatePath()).toBe('referral/confirmContactDetails')
    })
  })
})
