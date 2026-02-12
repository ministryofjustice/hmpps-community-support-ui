import { Factory } from 'fishery'
import { ReferralConfirmationContent } from '../../referral/confirmation/confirmationViewModel'

class confirmationContentFactory extends Factory<ReferralConfirmationContent> {}

export default confirmationContentFactory.define(({ transientParams }) => ({
  pageHeader: transientParams.pageHeader || 'Referral confirmation',
  referenceNumberIntro: transientParams.referenceNumberIntro || 'Your referral reference number is:',
}))
