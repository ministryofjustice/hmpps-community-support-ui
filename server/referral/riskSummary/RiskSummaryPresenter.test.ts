import { Response } from 'express'
import { CommunitySupportRiskDto } from '@community-support-api'
import RiskSummaryPresenter from './RiskSummaryPresenter'

jest.useFakeTimers().setSystemTime(new Date('2026-07-15'))

describe('RiskSummaryPresenter', () => {
  const risk: CommunitySupportRiskDto = {
    firstName: 'Alex',
    lastName: 'River',
    crn: 'X123456',
    dateOfBirth: '1975-02-20',
    assessmentWithin12Months: true,
    assessedOn: '2026-02-28T09:00:00',
    riskToSelf: {
      suicide: {
        risk: 'YES',
        previous: 'YES',
        previousConcernsText: 'Previous attempt in 2022 while in custody.',
        current: 'YES',
        currentConcernsText: 'Expressed suicidal ideation during last supervision.',
      },
      selfHarm: {
        risk: 'DK',
        previous: 'DK',
        previousConcernsText: null,
        current: 'DK',
        currentConcernsText: null,
      },
      custody: {
        risk: 'NO',
        previous: 'NO',
        previousConcernsText: null,
        current: 'NO',
        currentConcernsText: null,
      },
      hostelSetting: {
        risk: 'NO',
        previous: 'NO',
        previousConcernsText: null,
        current: 'NO',
        currentConcernsText: null,
      },
      vulnerability: {
        risk: 'YES',
        previous: 'NO',
        previousConcernsText: null,
        current: 'YES',
        currentConcernsText: 'Mental health deterioration noted by GP.',
      },
    },
    summary: {
      whoIsAtRisk: 'Public, known adults and staff are at risk.',
      natureOfRisk: 'Physical violence and intimidation towards others.',
      riskImminence: 'Risk is immediate, particularly when under the influence of alcohol.',
      riskIncreaseFactors: 'Alcohol and drug misuse.',
      riskMitigationFactors: 'Regular probation contact.',
      analysisOfRiskFactors: 'Pattern of domestic violence linked to substance misuse.',
      riskInCommunity: { HIGH: ['Public'] },
      riskInCustody: { LOW: ['Public'] },
      overallRiskLevel: 'VERY_HIGH',
    },
  }

  const res = {
    locals: {
      content: {
        pageSubHeader: 'OASys risk information',
        backLink: '/referral/task-list',
        crnLabel: 'CRN',
        dateOfBirthLabel: 'Date of birth',
        lastUpdatedLabel: 'Last updated (OASys)',
        defaultFieldValue: 'Not available',
        noConcernsText: 'No concerns identified',
        dontKnowText: `Don't know`,
        noAdditionalInformationText: 'None',
        changeHref: '/referral/task-list/view-risk-summary',
        whoIsAtRiskCard: { heading: 'Who is at risk', changeLinkText: 'Change' },
        natureOfRiskCard: { heading: 'What is the nature of the risk', changeLinkText: 'Change' },
        riskImminenceCard: { heading: 'When is the risk likely to be greatest', changeLinkText: 'Change' },
        selfHarmCard: { heading: 'Concerns in relation to self-harm', changeLinkText: 'Change' },
        suicideCard: { heading: 'Concerns in relation to suicide', changeLinkText: 'Change' },
        hostelSettingCard: { heading: 'Concerns in relation to coping in a hostel setting', changeLinkText: 'Change' },
        vulnerabilityCard: { heading: 'Concerns in relation to vulnerability', changeLinkText: 'Change' },
        additionalInformationCard: { heading: 'Additional information', changeLinkText: 'Change' },
        buttonText: 'Save and continue',
        postHref: '/referral/task-list/view-risk-summary',
      },
    },
  } as unknown as Response

  test('builds correct view model', () => {
    // Deliberately distinct from the CRN, to prove the back link uses the referral id, not the CRN.
    const presenter = new RiskSummaryPresenter(risk, 'referral-uuid-1')
    const viewModel = presenter.buildViewModel(res)

    expect(viewModel.backLink.href).toBe('/referral/task-list')
    expect(viewModel.heading).toBe('Alex River')
    expect(viewModel.subheading).toBe('OASys risk information')
    expect(viewModel.crn).toBe('X123456')
    expect(viewModel.dateOfBirth).toBe('20 February 1975 (51 years old)')
    expect(viewModel.lastUpdated).toBe('28 February 2026')

    const [whoIsAtRisk, natureOfRisk, riskImminence, selfHarm, suicide, hostelSetting, vulnerability, additional] =
      viewModel.rows

    expect(whoIsAtRisk.heading).toBe('Who is at risk')
    expect(whoIsAtRisk.content).toBe('Public, known adults and staff are at risk.')
    expect(whoIsAtRisk.changeLink).toEqual({ href: '/referral/task-list/view-risk-summary', text: 'Change' })

    expect(natureOfRisk.content).toBe('Physical violence and intimidation towards others.')
    expect(riskImminence.content).toBe('Risk is immediate, particularly when under the influence of alcohol.')

    expect(selfHarm.heading).toBe('Concerns in relation to self-harm')
    expect(selfHarm.content).toBe(`Don't know`)

    expect(suicide.heading).toBe('Concerns in relation to suicide')
    expect(suicide.content).toBe('Expressed suicidal ideation during last supervision.')

    expect(hostelSetting.heading).toBe('Concerns in relation to coping in a hostel setting')
    expect(hostelSetting.content).toBe('No concerns identified')

    expect(vulnerability.heading).toBe('Concerns in relation to vulnerability')
    expect(vulnerability.content).toBe('Mental health deterioration noted by GP.')

    expect(additional.heading).toBe('Additional information')
    expect(additional.content).toBe('None')

    expect(viewModel.button.text).toBe('Save and continue')
  })

  test('falls back to default text when summary and risk fields are missing', () => {
    const presenter = new RiskSummaryPresenter(
      {
        firstName: 'Alex',
        lastName: 'River',
        crn: 'X123456',
        dateOfBirth: '1975-02-20',
        assessmentWithin12Months: false,
        assessedOn: null,
        riskToSelf: null,
        summary: null,
      },
      'referral-uuid-1',
    )

    const viewModel = presenter.buildViewModel(res)

    expect(viewModel.lastUpdated).toBe('Not available')
    const [whoIsAtRisk, , , selfHarm, , , , additional] = viewModel.rows
    expect(whoIsAtRisk.content).toBe('Not available')
    expect(selfHarm.content).toBe('No concerns identified')
    expect(additional.content).toBe('None')
  })
})
