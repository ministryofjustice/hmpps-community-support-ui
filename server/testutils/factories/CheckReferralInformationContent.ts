import { Factory } from 'fishery'
import { CheckReferralInformationContent } from '../../referral/check-referral-information/checkReferralInformationViewModel'

class CheckReferralInformationContentFactory extends Factory<CheckReferralInformationContent> {}

export default CheckReferralInformationContentFactory.define(({ transientParams }) => ({
  pageTitle: transientParams.pageTitle || 'Check details and submit referral',
  pageHeader: transientParams.pageHeader || 'Check referral information',
  pageSubHeader: transientParams.pageSubHeader || 'Check details and submit referral',
  personalDetailsHeader: transientParams.personalDetailsHeader || 'About John',
  referralDetailsHeader: transientParams.referralDetailsHeader || 'Referral details',
  referralContactDetailsHeader: transientParams.referralContactDetailsHeader || 'Referral contact details',
  submitButtonText: transientParams.submitButtonText || 'Submit referral information',
  backLink: transientParams.backLink || '/referral/task-list',
}))
