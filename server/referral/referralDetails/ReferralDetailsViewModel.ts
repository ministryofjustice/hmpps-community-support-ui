export interface PersonalDetailsCard {
  heading: string
  nameLabel: string
  crnLabel: string
  dobLabel: string
  languageLabel: string
  disabilitiesLabel: string
}

export interface EqualityMonitoringCard {
  heading: string
  ethnicityLabel: string
  religionLabel: string
  sexLabel: string
  genderLabel: string
  sexualOrientationLabel: string
  transgenderLabel: string
}

export interface ContactDetailsCard {
  heading: string
  phoneNumberLabel: string
  mobileNumberLabel: string
  emailAddressLabel: string
  mainAddressLabel: string
}

export interface ReferralDetailsCard {
  heading: string
  referralDateLabel: string
  assignedToLabel: string
  link: string
}

export interface ReferralDetailsContent {
  pageHeader: string
  pageSubHeader: string
  personalDetailsCard: PersonalDetailsCard
  equalityMonitoringCard: EqualityMonitoringCard
  contactDetailsCard: ContactDetailsCard
  referralDetailsCard: ReferralDetailsCard
}
