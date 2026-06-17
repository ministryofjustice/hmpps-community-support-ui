export enum ChangeRequesterType {
  DELIVERY_PARTNER = 'DELIVERY_PARTNER',
  PROBATION_PRACTITIONER = 'PROBATION_PRACTITIONER',
  REFERRAL_USER = 'REFERRAL_USER',
}

export const ChangeRequesterLabels: Record<ChangeRequesterType, string> = {
  [ChangeRequesterType.DELIVERY_PARTNER]: 'Delivery partner',
  [ChangeRequesterType.PROBATION_PRACTITIONER]: 'Probation practitioner',
  [ChangeRequesterType.REFERRAL_USER]: 'Referral user',
} as const

export const getChangeRequesterLabel = (type?: ChangeRequesterType | string | null, referrerName?: string): string => {
  if (!type) return 'Unknown'

  if (type === ChangeRequesterType.REFERRAL_USER) {
    return referrerName?.trim() || ''
  }

  return ChangeRequesterLabels[type as ChangeRequesterType] ?? String(type)
}

export const getChangeRequesterType = (label?: string | null): ChangeRequesterType | null => {
  if (!label) return null

  const entry = Object.entries(ChangeRequesterLabels).find(([, value]) => value.toLowerCase() === label.toLowerCase())

  return entry ? (entry[0] as ChangeRequesterType) : ChangeRequesterType.REFERRAL_USER
}
