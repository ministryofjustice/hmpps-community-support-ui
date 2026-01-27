import { Factory } from 'fishery'
import { FoundPersonContent } from '../../referral/foundPerson/foundPersonViewModel'

class FoundPersonContentFactory extends Factory<FoundPersonContent> {}

export default FoundPersonContentFactory.define(({ transientParams }) => ({
  pageHeader: transientParams.pageHeader || `Confirm this is the correct person for referral`,
  continueButtonText: transientParams.continueButtonText || 'Continue',
  continueButtonLink: transientParams.continueButtonLink || '/referral/new/select-a-service',
}))
