import { CommunitySupportRiskDto, CommunitySupportRiskInformationDto } from '@community-support-api'

export default function buildRiskInformationRequest(
  risk: CommunitySupportRiskDto,
  referralId: string,
): CommunitySupportRiskInformationDto {
  const { riskToSelf, summary } = risk

  return {
    // Ignored by the API - it always uses the referralId path param and generates its own id.
    // TODO: Remove this property from the API request model in the future.
    id: referralId,
    referralId,
    riskSummaryWhoIsAtRisk: summary?.whoIsAtRisk,
    riskSummaryNatureOfRisk: summary?.natureOfRisk,
    riskSummaryRiskImminence: summary?.riskImminence,
    riskToSelfSuicide: riskToSelf?.suicide?.currentConcernsText,
    riskToSelfSelfHarm: riskToSelf?.selfHarm?.currentConcernsText,
    riskToSelfHostelSetting: riskToSelf?.hostelSetting?.currentConcernsText,
    riskToSelfVulnerability: riskToSelf?.vulnerability?.currentConcernsText,
    additionalInformation: riskToSelf?.custody?.currentConcernsText,
  }
}
