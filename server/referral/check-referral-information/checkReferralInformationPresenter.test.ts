import { Response } from 'express'
import { CheckDraftReferralDetailsDto } from '@community-support-api'
import type {
  CheckReferralInformationContent,
  CheckReferralInformationViewModel,
} from './checkReferralInformationViewModel'
import CheckReferralInformationPresenter from './checkReferralInformationPresenter'
import CheckReferralInformationContentFactory from '../../testutils/factories/CheckReferralInformationContent'

describe('CheckReferralInformationPresenter', () => {
  let res: Response
  let content: CheckReferralInformationContent
  beforeEach(() => {
    content = CheckReferralInformationContentFactory.build()
    res = {
      locals: { content },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response
  })
  describe('renderPage', () => {
    it('should render draft referral details', () => {
      const draftReferralDetails = {
        id: 'referralId123',
        createdDate: '2026-02-10T11:23:00.780Z',
        personDetailsTableData: {
          name: { firstName: 'John', lastName: 'Doe' },
          crn: 'X123456',
          dateOfBirth: '1975-02-20',
          preferredLanguage: 'English',
          disabilities: [{ description: 'Dyslexia', updatedAt: '2026-02-03T00:00:00Z' }],
          personalCircumstances: [
            { description: 'Employment', subDescription: 'Full-time employed', updatedAt: '2026-01-05T00:00:00Z' },
          ],
        },
        equalityDetailsTableData: { ethnicity: 'White British', religionOrBelief: 'None', sex: 'Male' },
        additionalInformationDetailsTableData: {},
        contactDetailsTableData: {},
        riskInformationDetailsTableData: {},
        additionalSupportNeedsDetailsTableData: {},
        personNeedsDetailsTableData: {},
        referralAreaTableData: { area: 'London' },
        mainPocDetailsTableData: {},
      } as CheckDraftReferralDetailsDto

      const presenter = new CheckReferralInformationPresenter(draftReferralDetails)
      presenter.renderPage(res)

      const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: CheckReferralInformationViewModel }

      expect(renderData.content.personalDetailsSummary.rows).toHaveLength(7)
      expect(renderData.content.personalDetailsSummary.rows[0]).toMatchObject({
        key: { text: 'Name' },
        value: { text: 'John Doe' },
      })
      expect(renderData.content.personalDetailsSummary.rows[1]).toMatchObject({
        key: { text: 'CRN' },
        value: { text: 'X123456' },
      })
      expect(renderData.content.personalDetailsSummary.rows[2]).toMatchObject({
        key: { text: 'Current location' },
        value: { text: 'Not available' },
      })
      expect(renderData.content.personalDetailsSummary.rows[3]).toMatchObject({
        key: { text: 'Date of birth' },
        value: { text: '20 Feb 1975 (51 years old)' },
      })
      expect(renderData.content.personalDetailsSummary.rows[4]).toMatchObject({
        key: { text: 'Preferred language' },
        value: { text: 'English' },
      })
      expect(renderData.content.personalDetailsSummary.rows[5]).toMatchObject({
        key: {
          html: '<b>Current circumstances</b>\n<div class="govuk-hint govuk-!-font-size-16">Last updated: 5 January 2026</div>',
        },
        value: {
          html: '<div>Relationship: Not available</div><div>Employment: Full-time employed</div><div>Dependents: Not available</div>',
        },
      })
      expect(renderData.content.personalDetailsSummary.rows[6]).toMatchObject({
        key: {
          html: '<b>Disabilities</b>\n<div class="govuk-hint govuk-!-font-size-16">Last updated: 3 February 2026</div>',
        },
        value: { html: '<div>Dyslexia</div>' },
      })
      expect(renderData.content.pageTitle).toBe('Check details and submit referral')
      expect(renderData.content.pageHeader).toBe('John Doe')
      expect(renderData.content.personalDetailsHeader).toBe('About John')
      expect(renderData.content.referralDetailsHeader).toBe('Referral details')
      expect(renderData.content.referralContactDetailsHeader).toBe('Referral contact details')
      expect(renderData.content.backLink).toEqual({ href: '/referral/task-list' })
      expect(renderData.content.submitButton).toEqual({
        text: 'Submit referral information',
        classes: 'govuk-!-margin-top-6',
      })

      expect(res.render).toHaveBeenCalledWith(
        'referral/checkReferralInformation',
        expect.objectContaining({} as CheckReferralInformationViewModel),
      )
    })

    it('should list each personal circumstance in a fixed order', () => {
      const draftReferralDetails = {
        id: 'referralId123',
        createdDate: '2026-02-10T11:23:00.780Z',
        personDetailsTableData: {
          name: { firstName: 'John', lastName: 'Doe' },
          crn: 'X123456',
          dateOfBirth: '1975-02-20',
          preferredLanguage: 'English',
          disabilities: [],
          personalCircumstances: [
            { description: 'Dependents', subDescription: 'Has Dependents', updatedAt: '2026-01-05T00:00:00Z' },
            {
              description: 'Employment',
              subDescription: 'In receipt of state benefit',
              updatedAt: '2026-01-05T00:00:00Z',
            },
            { description: 'Relationship', subDescription: 'Widowed', updatedAt: '2026-01-05T00:00:00Z' },
            {
              description: 'Employment',
              subDescription: 'Retired (not in receipt of a pension)',
              updatedAt: '2026-01-05T00:00:00Z',
            },
          ],
        },
        equalityDetailsTableData: {},
        additionalInformationDetailsTableData: {},
        contactDetailsTableData: {},
        riskInformationDetailsTableData: {},
        additionalSupportNeedsDetailsTableData: {},
        personNeedsDetailsTableData: {},
        referralAreaTableData: {},
        mainPocDetailsTableData: {},
      } as CheckDraftReferralDetailsDto

      new CheckReferralInformationPresenter(draftReferralDetails).renderPage(res)

      const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: CheckReferralInformationViewModel }

      expect(renderData.content.personalDetailsSummary.rows[5]).toMatchObject({
        value: {
          html: '<div>Relationship: Widowed</div><div>Employment: In receipt of state benefit, Retired (not in receipt of a pension)</div><div>Dependents: Has Dependents</div>',
        },
      })
    })

    it('should show unavailable personal circumstance categories', () => {
      const draftReferralDetails = {
        id: 'referralId123',
        createdDate: '2026-02-10T11:23:00.780Z',
        personDetailsTableData: {
          name: { firstName: 'John', lastName: 'Doe' },
          crn: 'X123456',
          dateOfBirth: '1975-02-20',
          preferredLanguage: 'English',
          disabilities: [],
          personalCircumstances: [
            { description: 'Employment', subDescription: 'Full-time employed', updatedAt: '2026-01-05T00:00:00Z' },
          ],
        },
        equalityDetailsTableData: {},
        additionalInformationDetailsTableData: {},
        contactDetailsTableData: {},
        riskInformationDetailsTableData: {},
        additionalSupportNeedsDetailsTableData: {},
        personNeedsDetailsTableData: {},
        referralAreaTableData: {},
        mainPocDetailsTableData: {},
      } as CheckDraftReferralDetailsDto

      new CheckReferralInformationPresenter(draftReferralDetails).renderPage(res)

      const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: CheckReferralInformationViewModel }

      expect(renderData.content.personalDetailsSummary.rows[5]).toMatchObject({
        value: {
          html: '<div>Relationship: Not available</div><div>Employment: Full-time employed</div><div>Dependents: Not available</div>',
        },
      })
    })

    it('should render a prison number when CRN is unavailable', () => {
      const draftReferralDetails = {
        id: 'referralId123',
        createdDate: '2026-02-10T11:23:00.780Z',
        personDetailsTableData: {
          name: { firstName: 'John', lastName: 'Doe' },
          crn: '',
          prisonNumber: 'A1234BC, B1234CD, C1234DE',
          dateOfBirth: '1975-02-20',
          preferredLanguage: 'English',
          disabilities: [],
          personalCircumstances: [],
        },
        equalityDetailsTableData: { ethnicity: 'White British', religionOrBelief: 'None', sex: 'Male' },
        additionalInformationDetailsTableData: {},
        contactDetailsTableData: {},
        riskInformationDetailsTableData: {},
        additionalSupportNeedsDetailsTableData: {},
        personNeedsDetailsTableData: {},
        referralAreaTableData: {},
        mainPocDetailsTableData: {},
      } as CheckDraftReferralDetailsDto

      const presenter = new CheckReferralInformationPresenter(draftReferralDetails)
      presenter.renderPage(res)

      const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: CheckReferralInformationViewModel }

      expect(renderData.content.personalDetailsSummary.rows[1]).toMatchObject({
        key: { text: 'Prison number' },
        value: { text: 'A1234BC, B1234CD, C1234DE' },
      })
    })

    it('should not render identifier row when no identifier is available', () => {
      const draftReferralDetails = {
        id: 'referralId123',
        createdDate: '2026-02-10T11:23:00.780Z',
        personDetailsTableData: {
          name: { firstName: 'John', lastName: 'Doe' },
          crn: '',
          dateOfBirth: '1975-02-20',
          preferredLanguage: 'English',
          disabilities: [],
          personalCircumstances: [],
        },
        equalityDetailsTableData: { ethnicity: 'White British', religionOrBelief: 'None', sex: 'Male' },
        additionalInformationDetailsTableData: {},
        contactDetailsTableData: {},
        riskInformationDetailsTableData: {},
        additionalSupportNeedsDetailsTableData: {},
        personNeedsDetailsTableData: {},
        referralAreaTableData: {},
        mainPocDetailsTableData: {},
      } as CheckDraftReferralDetailsDto

      const presenter = new CheckReferralInformationPresenter(draftReferralDetails)
      presenter.renderPage(res)

      const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: CheckReferralInformationViewModel }

      expect(renderData.content.personalDetailsSummary.rows).toHaveLength(6)
      expect(renderData.content.personalDetailsSummary.rows[1]).toMatchObject({
        key: { text: 'Current location' },
        value: { text: 'Not available' },
      })
      expect(renderData.content.personalDetailsSummary.rows[2]).toMatchObject({
        key: { text: 'Date of birth' },
        value: { text: '20 Feb 1975 (51 years old)' },
      })
    })
  })
})
