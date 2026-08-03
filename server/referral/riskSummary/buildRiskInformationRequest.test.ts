import { CommunitySupportRiskDto } from '@community-support-api'
import buildRiskInformationRequest from './buildRiskInformationRequest'

describe('buildRiskInformationRequest', () => {
  it('maps the ROSH risk data onto the risk information request', () => {
    const risk: CommunitySupportRiskDto = {
      firstName: 'Alex',
      lastName: 'River',
      crn: 'X123456',
      dateOfBirth: '1975-02-20',
      assessmentWithin12Months: true,
      assessedOn: '2026-02-28T09:00:00',
      riskToSelf: {
        suicide: { risk: 'YES', previous: 'YES', current: 'YES', currentConcernsText: 'Suicide concern' },
        selfHarm: { risk: 'DK', previous: 'DK', current: 'DK' },
        custody: { risk: 'NO', previous: 'NO', current: 'NO' },
        hostelSetting: { risk: 'NO', previous: 'NO', current: 'NO' },
        vulnerability: {
          risk: 'YES',
          previous: 'NO',
          current: 'YES',
          currentConcernsText: 'Vulnerability concern',
        },
      },
      additionalInformation: 'Custody concern',
      summary: {
        whoIsAtRisk: 'Public, known adults and staff are at risk.',
        natureOfRisk: 'Physical violence and intimidation towards others.',
        riskImminence: 'Risk is immediate.',
        riskIncreaseFactors: 'Alcohol and drug misuse.',
        riskMitigationFactors: 'Regular probation contact.',
        analysisOfRiskFactors: 'Pattern of domestic violence linked to substance misuse.',
        riskInCommunity: { HIGH: ['Public'] },
        riskInCustody: { LOW: ['Public'] },
        overallRiskLevel: 'VERY_HIGH',
      },
    }

    const result = buildRiskInformationRequest(risk)

    expect(result).toEqual({
      riskSummaryWhoIsAtRisk: 'Public, known adults and staff are at risk.',
      riskSummaryNatureOfRisk: 'Physical violence and intimidation towards others.',
      riskSummaryRiskImminence: 'Risk is immediate.',
      riskToSelfSuicide: 'Suicide concern',
      riskToSelfSelfHarm: undefined,
      riskToSelfHostelSetting: undefined,
      riskToSelfVulnerability: 'Vulnerability concern',
      additionalInformation: 'Custody concern',
    })
  })

  it('handles missing summary and riskToSelf data', () => {
    const risk: CommunitySupportRiskDto = {
      firstName: 'Alex',
      lastName: 'River',
      crn: 'X123456',
      dateOfBirth: '1975-02-20',
      assessmentWithin12Months: false,
      assessedOn: null,
      riskToSelf: null,
      summary: null,
    }

    const result = buildRiskInformationRequest(risk)

    expect(result).toEqual({
      riskSummaryWhoIsAtRisk: undefined,
      riskSummaryNatureOfRisk: undefined,
      riskSummaryRiskImminence: undefined,
      riskToSelfSuicide: undefined,
      riskToSelfSelfHarm: undefined,
      riskToSelfHostelSetting: undefined,
      riskToSelfVulnerability: undefined,
      additionalInformation: undefined,
    })
  })
})
