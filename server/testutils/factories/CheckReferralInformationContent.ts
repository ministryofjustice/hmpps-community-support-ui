import { Factory } from 'fishery'
import { CheckReferralInformationContent } from '../../referral/check-referral-information/checkReferralInformationViewModel'

class CheckReferralInformationContentFactory extends Factory<CheckReferralInformationContent> {}

export default CheckReferralInformationContentFactory.define(({ transientParams }) => ({
  pageTitle: transientParams.pageTitle || 'Check details and submit referral',
  pageHeader: transientParams.pageHeader || 'Check referral information',
  pageSubHeader: transientParams.pageSubHeader || 'Check details and submit referral',
  personalDetailsHeader: transientParams.personalDetailsHeader || 'About John',
  notAvailable: transientParams.notAvailable || 'Not available',
  personalDetailsCard: transientParams.personalDetailsCard || {
    heading: 'Personal details',
    nameLabel: 'Name',
    crnLabel: 'CRN',
    prisonNumberLabel: 'Prison number',
    locationLabel: 'Current location',
    dobLabel: 'Date of birth',
    languageLabel: 'Preferred language',
    currentCircumstancesLabel: 'Current circumstances',
    disabilitiesLabel: 'Disabilities',
    lastUpdatedLabel: 'Last updated',
  },
  additionalInformationCard: transientParams.additionalInformationCard || {
    heading: 'Additional information',
    homeOfficeInterestLabel: 'Home Office interest',
    opdPathwayLabel: 'Offender personality disorder (OPD) pathway',
  },
  riskInformationCard: transientParams.riskInformationCard || {
    heading: 'Risk information',
    whoIsAtRiskLabel: 'Who is at risk',
    riskNatureLabel: 'What is the nature of the risk?',
    riskCircumstancesLabel: 'In what circumstances or situations would offending be most likely to occur?',
    riskOfSelfHarmLabel: 'Risk of self-harm',
    riskOfSuicideLabel: 'Risk of suicide',
    concernsCopingInApprovedPremisesLabel: 'Concerns in relation to coping in an approved premises or hostel',
    concernsVulnerabilityLabel: 'Concerns in relation to vulnerability',
    additionalInformationLabel: 'Additional information',
    noAdditionalInformationText: 'None',
  },
  referralDetailsHeader: transientParams.referralDetailsHeader || 'Referral details',
  referralContactDetailsHeader: transientParams.referralContactDetailsHeader || 'Referral contact details',
  submitButtonText: transientParams.submitButtonText || 'Submit referral information',
  backLink: transientParams.backLink || '/referral/task-list',
}))
