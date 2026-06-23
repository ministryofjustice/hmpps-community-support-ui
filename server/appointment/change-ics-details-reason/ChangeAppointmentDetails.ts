export enum ChangeRequesterType {
  DELIVERY_PARTNER = 'DELIVERY_PARTNER',
  PROBATION_PRACTITIONER = 'PROBATION_PRACTITIONER',
  REFERRAL_USER = 'REFERRAL_USER',
}

export const ChangeRequesterLabels = {
  [ChangeRequesterType.DELIVERY_PARTNER]: 'Delivery partner',
  [ChangeRequesterType.PROBATION_PRACTITIONER]: 'Probation practitioner',
} as const

export const getChangeRequesterLabel = (type?: ChangeRequesterType | string | null, refereeName?: string): string => {
  if (!type) return 'Unknown'

  switch (type) {
    case ChangeRequesterType.REFERRAL_USER:
      return refereeName?.trim() || 'Referral user'

    case ChangeRequesterType.DELIVERY_PARTNER:
      return ChangeRequesterLabels.DELIVERY_PARTNER

    case ChangeRequesterType.PROBATION_PRACTITIONER:
      return ChangeRequesterLabels.PROBATION_PRACTITIONER

    default:
      return String(type)
  }
}

export const getChangeRequesterType = (label?: string | null): ChangeRequesterType | null => {
  if (!label) return null

  const entry = Object.entries(ChangeRequesterLabels).find(([, value]) => value.toLowerCase() === label.toLowerCase())

  return entry ? (entry[0] as ChangeRequesterType) : ChangeRequesterType.REFERRAL_USER
}
