import { CommunitySupportRiskInformationDto } from '@community-support-api'

export interface EditRiskSummaryFormData {
  riskSummaryWhoIsAtRisk?: string
  riskSummaryNatureOfRisk?: string
  riskSummaryRiskImminence?: string
  riskToSelfSuicide?: string
  riskToSelfSelfHarm?: string
  riskToSelfHostelSetting?: string
  riskToSelfVulnerability?: string
  additionalInformation?: string
}

export default function buildRiskInformationRequestFromForm(
  formData: EditRiskSummaryFormData,
): CommunitySupportRiskInformationDto {
  return {
    riskSummaryWhoIsAtRisk: formData.riskSummaryWhoIsAtRisk,
    riskSummaryNatureOfRisk: formData.riskSummaryNatureOfRisk,
    riskSummaryRiskImminence: formData.riskSummaryRiskImminence,
    riskToSelfSuicide: formData.riskToSelfSuicide,
    riskToSelfSelfHarm: formData.riskToSelfSelfHarm,
    riskToSelfHostelSetting: formData.riskToSelfHostelSetting,
    riskToSelfVulnerability: formData.riskToSelfVulnerability,
    additionalInformation: formData.additionalInformation,
  }
}
