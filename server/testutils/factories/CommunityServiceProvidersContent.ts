import { Factory } from 'fishery'
import { CommunityServiceProviderContent } from '../../referral/communityServiceProviders/communityServiceProvidersModel'

class CommunityServiceProviderContentFactory extends Factory<CommunityServiceProviderContent> {}

export default CommunityServiceProviderContentFactory.define(({ transientParams }) => ({
  pageHeader: transientParams.pageHeader || 'Community service providers',
  continueButtonText: transientParams.continueButtonText || 'Save and Continue',
}))
