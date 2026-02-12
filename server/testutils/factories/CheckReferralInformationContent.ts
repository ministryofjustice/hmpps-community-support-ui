import { Factory } from 'fishery'
import { CheckReferralInformationContent } from '../../referral/check-referral-information/checkReferralInformationViewModel'

class CheckReferralInformationContentFactory extends Factory<CheckReferralInformationContent> {}

export default CheckReferralInformationContentFactory.define(({ transientParams }) => ({
  pageHeader: transientParams.pageHeader || 'Check referral information',
  submitButtonText: transientParams.submitButtonText || 'Submit referral information',
}))
