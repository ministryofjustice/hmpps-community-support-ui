import { Factory } from 'fishery'
import { ConfirmIcsContent } from '../../appointment/confirm-ics/confirmIcsViewModel'

class ConfirmIcsContentFactory extends Factory<ConfirmIcsContent> {}

export default ConfirmIcsContentFactory.define(({ transientParams }) => ({
  pageHeader: transientParams.pageHeader || 'Check the details before scheduling the ICS',
  submitButtonText: transientParams.submitButtonText || 'Submit',
}))
