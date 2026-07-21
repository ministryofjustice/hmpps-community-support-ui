import { Factory } from 'fishery'
import { CommunityServiceProviderContent2 } from '../../referral/communityServiceProviders/communityServiceProvidersModel2'

class CommunityServiceProviderContentFactory extends Factory<CommunityServiceProviderContent2> {}

export default CommunityServiceProviderContentFactory.define(({ transientParams }) => ({
  pageHeader: transientParams.pageHeader || 'Community service providers',
  continueButtonText: transientParams.continueButtonText || 'Save and Continue',
}))
