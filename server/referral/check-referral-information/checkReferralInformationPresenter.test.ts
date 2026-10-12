import { Response } from 'express'
import { CheckDraftReferralDetailsDto } from '@community-support-api'
import type {
  CheckReferralInformationContent,
  CheckReferralInformationViewModel,
} from './checkReferralInformationViewModel'
import CheckReferralInformationPresenter from './checkReferralInformationPresenter'
import DraftReferralDetailsFactory from '../../testutils/factories/DraftReferralDetails'
import loadContentDataForTest from '../../testutils/loadContentDataForTest'

jest.useFakeTimers()
jest.setSystemTime(new Date('2026-10-07T00:00:00Z').getTime())

const content = loadContentDataForTest('/referral/check-referral-information') as CheckReferralInformationContent

describe('CheckReferralInformationPresenter', () => {
  let res: Response
  beforeEach(() => {
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
        referralAreaTableData: { area: 'London' },
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
        additionalSupportNeedsDetailsTableData: {
          physicalHealth: 'Mild asthma managed with inhaler.',
          mentalOrEmotionalHealth: 'Reports anxiety and occasional low mood.',
          neurodiversity: 'Suspected ADHD awaiting assessment.',
          locationAndTravel: 'Limited access to public transport.',
          caringResponsibilities: 'None reported.',
          employmentResponsibilities: 'Part-time warehouse role.',
          diversity: 'No additional diversity needs identified.',
          anyOtherNeeds: 'Requires support with appointment reminders.',
          interpreterLanguage: null,
        },
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
        mainPocDetailsTableData: {
          areTheseDetailsCorrect: true,
          name: 'Sarah Wilson',
          jobRole: 'Probation Officer',
          email: 'sarah.wilson@justice.gov.uk',
          phoneNumber: '0191 555 6789',
          pdu: 'Newcastle PDU',
          office: 'Newcastle',
          teamPhoneNumber: '0191 555 6700',
        },
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
      expect(renderData.content.pageTitle).toBe('Check details and submit referral – Community Support')
      expect(renderData.content.pageHeader).toBe('John Doe')
      expect(renderData.content.personalDetailsHeader).toBe('About John')
      expect(renderData.content.referralContactDetailsHeader).toBe('Referral contact details')
      expect(renderData.content.backLink).toEqual({ href: '/referral/task-list' })
      expect(renderData.content.referralDetailsSummary.rows[0]).toMatchObject({
        key: { text: 'Area the referral is being made to' },
        value: { text: 'London' },
      })
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
        key: { text: 'Who is at risk?' },
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

      const { additionalReferralInformationSummary } = renderData.content
      expect(additionalReferralInformationSummary?.card.title.text).toBe('Additional referral information')
      expect(additionalReferralInformationSummary.rows[0].key.text).toBe(
        'What date does the service need to be completed by?',
      )
      expect(additionalReferralInformationSummary.rows[0].value.text).toBe('27/10/2026')
      expect(additionalReferralInformationSummary.rows[1].key.text).toBe(
        'Why does it need to be completed by this date?',
      )
      expect(additionalReferralInformationSummary.rows[1].value.text).toBe('Reason')
      expect(additionalReferralInformationSummary.rows[2].key.text).toBe('How many days will you use for this service?')
      expect(additionalReferralInformationSummary.rows[2].value.text).toBe('5')
      expect(additionalReferralInformationSummary.rows[3].key.text).toBe('Offence')
      expect(additionalReferralInformationSummary.rows[3].value.text).toBe('offence')
      expect(additionalReferralInformationSummary.rows[4].key.text).toBe('Offence subcategory')
      expect(additionalReferralInformationSummary.rows[4].value.text).toBe('subcatagory')
      expect(additionalReferralInformationSummary.rows[5].key.text).toBe('Outcome')
      expect(additionalReferralInformationSummary.rows[5].value.text).toBe('outcome')
      expect(additionalReferralInformationSummary.rows[6].key.text).toBe('Sentence end date')
      expect(additionalReferralInformationSummary.rows[6].value.text).toBe('12 October 2026')
      expect(additionalReferralInformationSummary.rows[7].key.text).toBe('Any licence conditions or exclusion zones')
      expect(additionalReferralInformationSummary.rows[7].value.text).toBe('Not available')
      expect(additionalReferralInformationSummary.rows[8].key.text).toBe(
        'Anything else the delivery partner should know about John',
      )
      expect(additionalReferralInformationSummary.rows[8].value.text).toBe('Not available')

      const { probationPractitionersDetailsSummary } = renderData.content
      expect(probationPractitionersDetailsSummary?.card.title.text).toBe("Probation practitioner's details")
      expect(probationPractitionersDetailsSummary.rows[0].key.text).toBe('Are these details correct?')
      expect(probationPractitionersDetailsSummary.rows[0].value.text).toBe('Yes')
      expect(probationPractitionersDetailsSummary.rows[1].key.text).toBe('Name')
      expect(probationPractitionersDetailsSummary.rows[1].value.text).toBe('Sarah Wilson')
      expect(probationPractitionersDetailsSummary.rows[2].key.text).toBe('Job role')
      expect(probationPractitionersDetailsSummary.rows[2].value.text).toBe('Probation Officer')
      expect(probationPractitionersDetailsSummary.rows[3].key.text).toBe('Email address')
      expect(probationPractitionersDetailsSummary.rows[3].value.text).toBe('sarah.wilson@justice.gov.uk')
      expect(probationPractitionersDetailsSummary.rows[4].key.text).toBe('Phone number')
      expect(probationPractitionersDetailsSummary.rows[4].value.text).toBe('0191 555 6789')
      expect(probationPractitionersDetailsSummary.rows[5].key.text).toBe('PDU')
      expect(probationPractitionersDetailsSummary.rows[5].value.text).toBe('Newcastle PDU')
      expect(probationPractitionersDetailsSummary.rows[6].key.text).toBe('Probation office')
      expect(probationPractitionersDetailsSummary.rows[6].value.text).toBe('Newcastle')
      expect(probationPractitionersDetailsSummary.rows[7].key.text).toBe('Team phone number')
      expect(probationPractitionersDetailsSummary.rows[7].value.text).toBe('0191 555 6700')

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
