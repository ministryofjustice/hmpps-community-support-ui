import { Response } from 'express'
import { CommunitySupportRiskDto } from '@community-support-api'
import EditRiskSummaryPresenter from './EditRiskSummaryPresenter'

jest.useFakeTimers().setSystemTime(new Date('2026-07-15'))

describe('EditRiskSummaryPresenter', () => {
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
        // Case worker edited this via the edit page despite OASys recording 'DK' - the edit should win.
        currentConcernsText: 'User confirmed no self-harm concerns following review.',
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
        // Case worker edited this via the edit page despite OASys recording 'NO' - the edit should win.
        currentConcernsText: 'User updated: no ongoing hostel setting concerns identified during review.',
      },
      vulnerability: {
        risk: 'YES',
        previous: 'NO',
        previousConcernsText: null,
        current: 'YES',
        currentConcernsText: 'Mental health deterioration noted by GP.',
      },
    },
    additionalInformation: 'Known to associate with a co-defendant in the local area.',
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
        pageHeader: 'Edit OASys risk information',
        backLink: '/referral/task-list/view-risk-summary',
        crnLabel: 'CRN',
        dateOfBirthLabel: 'Date of birth',
        lastUpdatedLabel: 'Last updated (OASys)',
        defaultFieldValue: 'Not available',
        yesText: 'Yes',
        noText: 'No',
        dontKnowText: `Don't know`,
        noAdditionalInformationText: 'None',
        submitHref: '/referral/task-list/edit-risk-summary',
        buttonText: 'Save and continue',
        whoIsAtRiskField: { id: 'riskSummaryWhoIsAtRisk', label: 'Who is at risk' },
        natureOfRiskField: { id: 'riskSummaryNatureOfRisk', label: 'What is the nature of the risk' },
        riskImminenceField: {
          id: 'riskSummaryRiskImminence',
          label: 'In what circumstances or situations would offending be most likely to occur?',
        },
        selfHarmField: { id: 'riskToSelfSelfHarm', label: 'Risk of self-harm' },
        suicideField: { id: 'riskToSelfSuicide', label: 'Risk of suicide' },
        hostelSettingField: {
          id: 'riskToSelfHostelSetting',
          label: 'Concerns in relation to coping in a hostel setting',
        },
        vulnerabilityField: { id: 'riskToSelfVulnerability', label: 'Concerns in relation to vulnerability' },
        additionalInformationField: { id: 'additionalInformation', label: 'Additional information' },
      },
    },
  } as unknown as Response

  test('builds correct view model', () => {
    const presenter = new EditRiskSummaryPresenter(risk)
    const viewModel = presenter.buildViewModel(res)

    expect(viewModel.backLink.href).toBe('/referral/task-list/view-risk-summary')
    expect(viewModel.heading).toBe('Alex River')
    expect(viewModel.subheading).toBe('Edit OASys risk information')
    expect(viewModel.crn).toBe('X123456')
    expect(viewModel.dateOfBirth).toBe('20 February 1975 (51 years old)')
    expect(viewModel.lastUpdatedInset).toEqual({
      text: 'Last updated (OASys): 28 February 2026',
      attributes: { 'data-qa': 'last-updated' },
    })

    const [whoIsAtRisk, natureOfRisk, riskImminence, selfHarm, suicide, hostelSetting, vulnerability, additional] =
      viewModel.textareas

    expect(whoIsAtRisk.id).toBe('riskSummaryWhoIsAtRisk')
    expect(whoIsAtRisk.name).toBe('riskSummaryWhoIsAtRisk')
    expect(whoIsAtRisk.value).toBe('Public, known adults and staff are at risk.')
    expect(whoIsAtRisk.hint).toBeFalsy()

    expect(natureOfRisk.value).toBe('Physical violence and intimidation towards others.')
    expect(riskImminence.value).toBe('Risk is immediate, particularly when under the influence of alcohol.')

    expect(selfHarm.id).toBe('riskToSelfSelfHarm')
    expect(selfHarm.value).toBe('User confirmed no self-harm concerns following review.')
    expect(selfHarm.hint).toEqual({ text: `Don't know`, classes: 'govuk-body' })

    expect(suicide.id).toBe('riskToSelfSuicide')
    expect(suicide.value).toBe('Expressed suicidal ideation during last supervision.')
    expect(suicide.hint).toEqual({ text: 'Yes', classes: 'govuk-body' })

    expect(hostelSetting.id).toBe('riskToSelfHostelSetting')
    expect(hostelSetting.value).toBe('User updated: no ongoing hostel setting concerns identified during review.')
    expect(hostelSetting.hint).toEqual({ text: 'No', classes: 'govuk-body' })

    expect(vulnerability.id).toBe('riskToSelfVulnerability')
    expect(vulnerability.value).toBe('Mental health deterioration noted by GP.')
    expect(vulnerability.hint).toEqual({ text: 'Yes', classes: 'govuk-body' })

    expect(additional.id).toBe('additionalInformation')
    expect(additional.value).toBe('Known to associate with a co-defendant in the local area.')
    expect(additional.hint).toBeFalsy()

    expect(viewModel.button.text).toBe('Save and continue')
    expect(viewModel.submitHref).toBe('/referral/task-list/edit-risk-summary')
  })

  test('falls back to empty values when summary and risk fields are missing', () => {
    const presenter = new EditRiskSummaryPresenter({
      firstName: 'Alex',
      lastName: 'River',
      crn: 'X123456',
      dateOfBirth: '1975-02-20',
      assessmentWithin12Months: false,
      assessedOn: null,
      riskToSelf: null,
      summary: null,
    })

    const viewModel = presenter.buildViewModel(res)

    expect(viewModel.lastUpdatedInset.text).toBe('Last updated (OASys): Not available')
    const [whoIsAtRisk, , , selfHarm, , , , additional] = viewModel.textareas
    expect(whoIsAtRisk.value).toBe('')
    expect(selfHarm.value).toBe('')
    expect(selfHarm.hint).toEqual({ text: 'Not available', classes: 'govuk-body' })
    expect(additional.value).toBe('')
    expect(additional.hint).toEqual({ text: 'None', classes: 'govuk-body' })
  })
})
