import { Response } from 'express'
import { CheckDraftReferralDetailsDto } from '@community-support-api'
import type {
  CheckReferralInformationContent,
  CheckReferralInformationViewModel,
} from './checkReferralInformationViewModel'
import CheckReferralInformationPresenter from './checkReferralInformationPresenter'
import CheckReferralInformationContentFactory from '../../testutils/factories/CheckReferralInformationContent'
import DraftReferralDetailsFactory from '../../testutils/factories/DraftReferralDetails'

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
    const buildDraftReferralDetails = (overrides = {}): CheckDraftReferralDetailsDto =>
      DraftReferralDetailsFactory.build(overrides) as unknown as CheckDraftReferralDetailsDto

    it('should render draft referral details', () => {
      const draftReferralDetails = DraftReferralDetailsFactory.build({
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
        additionalInformationDetailsTableData: {
          ofHomeOfficeInterest: true,
          homeOfficeInterestNotes: 'Claiming asylum from Iran',
          offenderPersonalityDisorderPathway: 'Assessment ongoing',
        },
        contactDetailsTableData: {},
        riskInformationDetailsTableData: {
          whoIsAtRisk: 'Family members',
          natureOfRisk: 'Violence',
          riskImminence: 'When intoxicated',
          riskOfSelfHarm: 'Low',
          riskOfSuicide: 'Low',
          riskToSelfHostelSetting: 'No concerns',
          riskToSelfVulnerability: 'Vulnerable',
          additionalInformation: 'Some additional risk info',
        },
        additionalSupportNeedsDetailsTableData: {},
        personNeedsDetailsTableData: {},
        referralAreaTableData: { area: 'London' },
        mainPocDetailsTableData: {},
      } as CheckDraftReferralDetailsDto)

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

      expect(renderData.content.additionalInformationSummary.rows).toHaveLength(2)
      expect(renderData.content.additionalInformationSummary.rows[0]).toMatchObject({
        key: { text: 'Home Office interest' },
        value: { html: '<div>Yes</div><br/><div>Claiming asylum from Iran</div>' },
      })
      expect(renderData.content.additionalInformationSummary.rows[1]).toMatchObject({
        key: { text: 'Offender personality disorder (OPD) pathway' },
        value: { text: 'Assessment ongoing' },
      })

      expect(renderData.content.riskInformationSummary.rows).toHaveLength(8)
      expect(renderData.content.riskInformationSummary.rows[0]).toMatchObject({
        key: { text: 'Who is at risk' },
        value: { text: 'Family members' },
      })
      expect(renderData.content.riskInformationSummary.rows[1]).toMatchObject({
        key: { text: 'What is the nature of the risk?' },
        value: { text: 'Violence' },
      })
      expect(renderData.content.riskInformationSummary.rows[2]).toMatchObject({
        key: { text: 'In what circumstances or situations would offending be most likely to occur?' },
        value: { text: 'When intoxicated' },
      })
      expect(renderData.content.riskInformationSummary.rows[3]).toMatchObject({
        key: { text: 'Risk of self-harm' },
        value: { text: 'Low' },
      })
      expect(renderData.content.riskInformationSummary.rows[4]).toMatchObject({
        key: { text: 'Risk of suicide' },
        value: { text: 'Low' },
      })
      expect(renderData.content.riskInformationSummary.rows[5]).toMatchObject({
        key: { text: 'Concerns in relation to coping in an approved premises or hostel' },
        value: { text: 'No concerns' },
      })
      expect(renderData.content.riskInformationSummary.rows[6]).toMatchObject({
        key: { text: 'Concerns in relation to vulnerability' },
        value: { text: 'Vulnerable' },
      })
      expect(renderData.content.riskInformationSummary.rows[7]).toMatchObject({
        key: { text: 'Additional information' },
        value: { text: 'Some additional risk info' },
      })

      expect(res.render).toHaveBeenCalledWith(
        'referral/checkReferralInformation',
        expect.objectContaining({} as CheckReferralInformationViewModel),
      )
    })

    it('should render main address when person is not in custody', () => {
      const draftReferralDetails = buildDraftReferralDetails({
        personDetailsTableData: {
          name: { firstName: 'John', lastName: 'Doe' },
          crn: 'X123456',
          dateOfBirth: '1975-02-20',
          preferredLanguage: 'English',
          disabilities: [],
          personalCircumstances: [],
        },
        contactDetailsTableData: {
          phoneNumber: '0123',
          mobileNumber: '0456',
          email: 'a@b.com',
          address: 'HMP Somewhere',
          inCustody: false,
          addressType: 'Prison',
          addressStartDate: '2026-01-01',
          addressNotes: 'Notes',
        },
      })

      const presenter = new CheckReferralInformationPresenter(draftReferralDetails)
      presenter.renderPage(res)

      const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: CheckReferralInformationViewModel }
      const contact = renderData.content.contactDetailsSummary
      expect(contact.rows[0]).toMatchObject({
        key: { text: content.contactDetailsCard.phoneNumberLabel },
        value: { text: '0123' },
      })
      expect(contact.rows[1]).toMatchObject({
        key: { text: content.contactDetailsCard.mobileNumberLabel },
        value: { text: '0456' },
      })
      expect(contact.rows[2]).toMatchObject({
        key: { text: content.contactDetailsCard.emailAddressLabel },
        value: { text: 'a@b.com' },
      })
      expect(contact.rows[3].key).toHaveProperty('html')
      expect(contact.rows[3].key.html).toContain(content.contactDetailsCard.mainAddressLabel)
      expect(contact.rows[3].value).toHaveProperty('html')
      expect(contact.rows[3].value.html).toContain('HMP Somewhere')
    })

    it('should render last known address when person is in custody', () => {
      const draftReferralDetails = buildDraftReferralDetails({
        personDetailsTableData: {
          name: { firstName: 'John', lastName: 'Doe' },
          crn: 'X123456',
          dateOfBirth: '1975-02-20',
          preferredLanguage: 'English',
          disabilities: [],
          personalCircumstances: [],
        },
        contactDetailsTableData: {
          phoneNumber: '0123',
          mobileNumber: '0456',
          email: 'a@b.com',
          address: 'HMP Somewhere',
          inCustody: true,
          addressType: 'Prison',
          addressStartDate: '2026-01-01',
          addressNotes: 'Notes',
        },
      })

      const presenter = new CheckReferralInformationPresenter(draftReferralDetails)
      presenter.renderPage(res)

      const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: CheckReferralInformationViewModel }
      const contact = renderData.content.contactDetailsSummary
      expect(contact.rows[0]).toMatchObject({
        key: { text: content.contactDetailsCard.phoneNumberLabel },
        value: { text: '0123' },
      })
      expect(contact.rows[1]).toMatchObject({
        key: { text: content.contactDetailsCard.mobileNumberLabel },
        value: { text: '0456' },
      })
      expect(contact.rows[2]).toMatchObject({
        key: { text: content.contactDetailsCard.emailAddressLabel },
        value: { text: 'a@b.com' },
      })
      expect(contact.rows[3].key).toHaveProperty('html')
      expect(contact.rows[3].key.html).toContain(content.contactDetailsCard.lastKnownAddressLabel)
      expect(contact.rows[3].value).toHaveProperty('html')
      expect(contact.rows[3].value.html).toContain('HMP Somewhere')
    })

    it('should render no fixed abode text when noFixedAddress is true', () => {
      const draftReferralDetails = buildDraftReferralDetails({
        personDetailsTableData: {
          name: { firstName: 'John', lastName: 'Doe' },
          crn: 'X123456',
          dateOfBirth: '1975-02-20',
          preferredLanguage: 'English',
          disabilities: [],
          personalCircumstances: [],
        },
        contactDetailsTableData: {
          phoneNumber: '',
          mobileNumber: '',
          email: null,
          address: null,
          noFixedAddress: true,
        },
      } as unknown as CheckDraftReferralDetailsDto)

      const presenter = new CheckReferralInformationPresenter(draftReferralDetails)
      presenter.renderPage(res)

      const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: CheckReferralInformationViewModel }
      const contact = renderData.content.contactDetailsSummary
      expect(contact.rows[3].value.html).toContain(content.contactDetailsCard.noFixedAbode)
    })

    it('should list each personal circumstance in a fixed order', () => {
      const draftReferralDetails = buildDraftReferralDetails({
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
      } as CheckDraftReferralDetailsDto)

      new CheckReferralInformationPresenter(draftReferralDetails).renderPage(res)

      const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: CheckReferralInformationViewModel }

      expect(renderData.content.personalDetailsSummary.rows[5]).toMatchObject({
        value: {
          html: '<div>Relationship: Widowed</div><div>Employment: In receipt of state benefit, Retired (not in receipt of a pension)</div><div>Dependents: Has Dependents</div>',
        },
      })
    })

    it('should show unavailable personal circumstance categories', () => {
      const draftReferralDetails = buildDraftReferralDetails({
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
      } as CheckDraftReferralDetailsDto)

      new CheckReferralInformationPresenter(draftReferralDetails).renderPage(res)

      const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: CheckReferralInformationViewModel }

      expect(renderData.content.personalDetailsSummary.rows[5]).toMatchObject({
        value: {
          html: '<div>Relationship: Not available</div><div>Employment: Full-time employed</div><div>Dependents: Not available</div>',
        },
      })
    })

    it('should render a prison number when CRN is unavailable', () => {
      const draftReferralDetails = buildDraftReferralDetails({
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
      } as CheckDraftReferralDetailsDto)

      const presenter = new CheckReferralInformationPresenter(draftReferralDetails)
      presenter.renderPage(res)

      const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: CheckReferralInformationViewModel }

      expect(renderData.content.personalDetailsSummary.rows[1]).toMatchObject({
        key: { text: 'Prison number' },
        value: { text: 'A1234BC, B1234CD, C1234DE' },
      })
    })

    it('should not render identifier row when no identifier is available', () => {
      const draftReferralDetails = buildDraftReferralDetails({
        personDetailsTableData: {
          name: { firstName: 'John', lastName: 'Doe' },
          crn: '',
          dateOfBirth: '1975-02-20',
          preferredLanguage: 'English',
          disabilities: [],
          personalCircumstances: [],
        },
        equalityDetailsTableData: { ethnicity: 'White British', religionOrBelief: 'None', sex: 'Male' },
      } as CheckDraftReferralDetailsDto)

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

    it('should not include additional information summary when no additional information provided', () => {
      const draftReferralDetails = buildDraftReferralDetails({
        personDetailsTableData: {
          name: { firstName: 'John', lastName: 'Doe' },
          crn: 'X123456',
          dateOfBirth: '1975-02-20',
          preferredLanguage: 'English',
          disabilities: [],
          personalCircumstances: [],
        },
        additionalInformationDetailsTableData: {},
      } as CheckDraftReferralDetailsDto)

      new CheckReferralInformationPresenter(draftReferralDetails).renderPage(res)

      const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: CheckReferralInformationViewModel }

      expect(renderData.content.additionalInformationSummary!.rows).toHaveLength(0)
    })
  })
})
