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
        personNeedsDetailsTableData: {
          hasAccommodationNeeds: true,
          accommodationDetails: 'Has suitable housing',
          employmentAndEducation: 'Seeking part-time work',
          financialDetails: 'On benefits',
          personalRelationshipsCommunityDetails: 'Has supportive family',
          drugUseDetails: 'No current use',
          alcoholUseDetails: 'Occasional',
          healthWellbeingDetails: 'Good',
          thinkingBehavioursAttitudeDetails: 'Responds well to prompts',
        },
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

      // persons needs summary should render all labels with provided data (not 'No')
      expect(renderData.content.personsNeedsSummary!.rows).toHaveLength(8)
      expect(renderData.content.personsNeedsSummary!.rows[0]).toMatchObject({
        key: { text: 'Accommodation' },
        value: { html: expect.stringContaining('Has suitable housing') },
      })
      expect(renderData.content.personsNeedsSummary!.rows[1]).toMatchObject({
        key: { text: 'Employment and education' },
        value: { html: expect.stringContaining('Seeking part-time work') },
      })
      expect(renderData.content.personsNeedsSummary!.rows[2]).toMatchObject({
        key: { text: 'Finances' },
        value: { html: expect.stringContaining('On benefits') },
      })
      expect(renderData.content.personsNeedsSummary!.rows[3]).toMatchObject({
        key: { text: 'Personal relationships and community' },
        value: { html: expect.stringContaining('Has supportive family') },
      })
      expect(renderData.content.personsNeedsSummary!.rows[4]).toMatchObject({
        key: { text: 'Drug use' },
        value: { html: expect.stringContaining('No current use') },
      })
      expect(renderData.content.personsNeedsSummary!.rows[5]).toMatchObject({
        key: { text: 'Alcohol use' },
        value: { html: expect.stringContaining('Occasional') },
      })
      expect(renderData.content.personsNeedsSummary!.rows[6]).toMatchObject({
        key: { text: 'Health and wellbeing' },
        value: { html: expect.stringContaining('Good') },
      })
      expect(renderData.content.personsNeedsSummary!.rows[7]).toMatchObject({
        key: { text: 'Thinking, behaviour and attitudes' },
        value: { html: expect.stringContaining('Responds well to prompts') },
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

    it('should not include additional information summary when no additional information provided', () => {
      const draftReferralDetails = {
        id: 'referralId123',
        createdDate: '2026-02-10T11:23:00.780Z',
        personDetailsTableData: {
          name: { firstName: 'John', lastName: 'Doe' },
          crn: 'X123456',
          dateOfBirth: '1975-02-20',
          preferredLanguage: 'English',
          disabilities: [],
          personalCircumstances: [],
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

      expect(renderData.content.additionalInformationSummary!.rows).toHaveLength(0)
    })
  })
})
