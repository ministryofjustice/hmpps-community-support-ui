import type { CriminogenicNeedsRequest } from '@community-support-api'

export type checkboxItemNames =
  | 'accommodation'
  | 'employment'
  | 'finances'
  | 'relationships'
  | 'drugUse'
  | 'alcoholUse'
  | 'health'
  | 'thinking'

export type PersonNeeds = {
  personNeedsCheckboxes: checkboxItemNames[]
  accommodationInput: string
  employmentInput: string
  financesInput: string
  relationshipsInput: string
  drugUseInput: string
  alcoholUseInput: string
  healthInput: string
  thinkingInput: string
}

export default function buildPersonNeedsRequest(personNeeds: PersonNeeds): CriminogenicNeedsRequest {
  const hasAccommodationNeeds = personNeeds.personNeedsCheckboxes.includes('accommodation')
  const hasEmploymentEducationNeeds = personNeeds.personNeedsCheckboxes.includes('employment')
  const hasFinancialNeeds = personNeeds.personNeedsCheckboxes.includes('finances')
  const hasPersonalRelationshipsCommunityNeeds = personNeeds.personNeedsCheckboxes.includes('relationships')
  const hasDrugUseNeeds = personNeeds.personNeedsCheckboxes.includes('drugUse')
  const hasAlcoholUseNeeds = personNeeds.personNeedsCheckboxes.includes('alcoholUse')
  const hasHealthWellbeingNeeds = personNeeds.personNeedsCheckboxes.includes('health')
  const hasThinkingBehavioursAttitudeNeeds = personNeeds.personNeedsCheckboxes.includes('thinking')
  return {
    hasAccommodationNeeds,
    accommodationDetails: hasAccommodationNeeds ? personNeeds.accommodationInput : null,
    hasEmploymentEducationNeeds,
    employmentEducationDetails: hasEmploymentEducationNeeds ? personNeeds.employmentInput : null,
    hasFinancialNeeds,
    financialDetails: hasFinancialNeeds ? personNeeds.financesInput : null,
    hasPersonalRelationshipsCommunityNeeds,
    personalRelationshipsCommunityDetails: hasPersonalRelationshipsCommunityNeeds
      ? personNeeds.relationshipsInput
      : null,
    hasDrugUseNeeds,
    drugUseDetails: hasDrugUseNeeds ? personNeeds.drugUseInput : null,
    hasAlcoholUseNeeds,
    alcoholUseDetails: hasAlcoholUseNeeds ? personNeeds.alcoholUseInput : null,
    hasHealthWellbeingNeeds,
    healthWellbeingDetails: hasHealthWellbeingNeeds ? personNeeds.healthInput : null,
    hasThinkingBehavioursAttitudeNeeds,
    thinkingBehavioursAttitudeDetails: hasThinkingBehavioursAttitudeNeeds ? personNeeds.thinkingInput : null,
  }
}
