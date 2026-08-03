import { CommunitySupportRiskDto, CommunitySupportRiskInformationDto } from '@community-support-api'

export default function buildRiskInformationRequest(risk: CommunitySupportRiskDto): CommunitySupportRiskInformationDto {
  const { riskToSelf, summary } = risk

  return {
    riskSummaryWhoIsAtRisk: summary?.whoIsAtRisk,
    riskSummaryNatureOfRisk: summary?.natureOfRisk,
    riskSummaryRiskImminence: summary?.riskImminence,
    riskToSelfSuicide: riskToSelf?.suicide?.currentConcernsText,
    riskToSelfSelfHarm: riskToSelf?.selfHarm?.currentConcernsText,
    riskToSelfHostelSetting: riskToSelf?.hostelSetting?.currentConcernsText,
    riskToSelfVulnerability: riskToSelf?.vulnerability?.currentConcernsText,
    additionalInformation: risk.additionalInformation,
  }
}
