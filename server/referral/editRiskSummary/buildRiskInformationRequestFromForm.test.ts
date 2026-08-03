import buildRiskInformationRequestFromForm from './buildRiskInformationRequestFromForm'

describe('buildRiskInformationRequestFromForm', () => {
  it('maps the submitted form data onto the risk information request', () => {
    const result = buildRiskInformationRequestFromForm({
      riskSummaryWhoIsAtRisk: 'Public, known adults and staff are at risk.',
      riskSummaryNatureOfRisk: 'Physical violence and intimidation towards others.',
      riskSummaryRiskImminence: 'Risk is immediate.',
      riskToSelfSuicide: 'Suicide concern',
      riskToSelfSelfHarm: 'Self harm concern',
      riskToSelfHostelSetting: 'Hostel setting concern',
      riskToSelfVulnerability: 'Vulnerability concern',
      additionalInformation: 'Custody concern',
    })

    expect(result).toEqual({
      riskSummaryWhoIsAtRisk: 'Public, known adults and staff are at risk.',
      riskSummaryNatureOfRisk: 'Physical violence and intimidation towards others.',
      riskSummaryRiskImminence: 'Risk is immediate.',
      riskToSelfSuicide: 'Suicide concern',
      riskToSelfSelfHarm: 'Self harm concern',
      riskToSelfHostelSetting: 'Hostel setting concern',
      riskToSelfVulnerability: 'Vulnerability concern',
      additionalInformation: 'Custody concern',
    })
  })

  it('handles missing form fields', () => {
    const result = buildRiskInformationRequestFromForm({})

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
