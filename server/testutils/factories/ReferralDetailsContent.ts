import { Factory } from 'fishery'
import { ReferralDetailsContent } from '../../referral/referralDetails/ReferralDetailsViewModel'

class referralDetailsContentFactory extends Factory<ReferralDetailsContent> {}

export default referralDetailsContentFactory.define(({ transientParams }) => ({
  pageHeader: transientParams.pageHeader || 'Referral for ',
  pageSubHeader: transientParams.pageSubHeader || 'Case details',
  subNavTitle: transientParams.subNavTitle || 'Sub navigation',
  subNavItems: transientParams.subNavItems || [
    { text: 'Case details', href: '/referral-details' },
    { text: 'Progress', href: '/progress' },
    { text: 'Change log', href: '/change-log' },
  ],
  backLink: '/unassigned-cases',
  defaultFieldValue: 'Not available',
  successBannerHeading: 'Case assigned',
  personalDetailsCard: {
    heading: 'Personal details',
    nameLabel: 'Name',
    crnLabel: 'CRN',
    dobLabel: 'Date of Birth',
    languageLabel: 'Preferred language',
    disabilitiesLabel: 'Disabilities',
  },
  equalityMonitoringCard: {
    heading: 'Equality monitoring',
    ethnicityLabel: 'Ethnicity',
    religionLabel: 'Religion or belief',
    sexLabel: 'Sex',
    genderLabel: 'Gender identity',
    sexualOrientationLabel: 'Sexual orientation',
    transgenderLabel: 'Transgender',
  },
  contactDetailsCard: {
    heading: 'Contact details',
    phoneNumberLabel: 'Phone number',
    mobileNumberLabel: 'Mobile number',
    emailAddressLabel: 'Email address',
    mainAddressLabel: 'Main address',
  },
  referralDetailsCard: {
    heading: 'Referral details',
    referralDateLabel: 'Referral date',
    assignedToLabel: 'Assigned to',
    assignedToDefaultValue: 'Unassigned',
    link: 'Assign to caseworker',
    linkChange: 'Change',
  },
}))
