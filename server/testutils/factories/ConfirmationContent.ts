import { Factory } from 'fishery'
import { ReferralConfirmationContent } from '../../referral/confirmation/confirmationViewModel'

class confirmationContentFactory extends Factory<ReferralConfirmationContent> {}

export default confirmationContentFactory.define(({ transientParams }) => ({
  pageHeader: transientParams.pageHeader || 'Referral confirmation',
  referenceNumberIntro: transientParams.referenceNumberIntro || 'Your referral reference number is:',
  startNewReferralLink: transientParams.startNewReferralLink || '/referral/new/find-a-person',
  startNewReferralButtonText: transientParams.startNewReferralButtonText || 'Start a new referral',
  backToCommunityHomeLink: transientParams.backToCommunityHomeLink || '/',
  backToCommunityHomeLinkText: transientParams.backToCommunityHomeLinkText || 'Back to Community Support Homepage',
}))
