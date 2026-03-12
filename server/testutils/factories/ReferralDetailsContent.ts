import { Factory } from 'fishery'
import { ReferralDetailsContent } from '../../referral/referralDetails/ReferralDetailsViewModel'

class referralDetailsContentFactory extends Factory<ReferralDetailsContent> {}

export default referralDetailsContentFactory.define(({ transientParams }) => ({
  pageHeader: transientParams.pageHeader || 'Referral for ',
  pageSubHeader: transientParams.pageSubHeader || 'Case details',
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
    phoneNumberDefaultValue: 'No phone number',
    mobileNumberDefaultValue: 'No mobile number',
    emailAddressDefaultValue: 'No email address',
    mainAddressDefaultValue: 'No main address',
  },
  referralDetailsCard: {
    heading: 'Referral details',
    referralDateLabel: 'Referral date',
    assignedToLabel: 'Assigned to',
    link: 'Assign to caseworker',
    assignedToDefaultValue: 'Unassigned',
  },
}))
