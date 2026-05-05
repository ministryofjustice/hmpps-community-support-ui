import { Factory } from 'fishery'
import { IcsFeedbackHowSessionTookPlaceContent } from '../../appointment/ics-feedback/icsFeedbackHowSessionTookPlaceViewModel'

class IcsFeedbackContentFactory extends Factory<IcsFeedbackHowSessionTookPlaceContent> {}

export default IcsFeedbackContentFactory.define(({ transientParams }) => ({
  submitButtonText: transientParams.submitButtonText || 'Continue',
  pageHeaders: {
    PHONE: 'Did the session take place by phone call?',
    VIDEO: 'Did the session take place by video call?',
    IN_PERSON_PROBATION_OFFICE: 'Did the session take place in person at this probation office?',
    IN_PERSON_OTHER_LOCATION: 'Did the session take place in person at this location?',
    default: 'Did the session take place?',
  },
  videoCallReasonLabel: 'Why was this session not in-person?',
  phoneCallReasonLabel: 'Why was this session not in-person?',
  probationOfficeSelectBlankText: 'Select probation office',
  probationOfficeSelectLabel: 'Select a probation office',
  addressLine1Label: 'Address line 1',
  addressLine2Label: 'Address line 2 (optional)',
  townOrCityLabel: 'Town or city',
  countyLabel: 'County (optional)',
  postcodeLabel: 'Postcode',
  howSessionLegend: 'How did the session take place?',
  howSessionHint: 'Select one option.',
  phoneCallOptionText: 'Phone call',
  videoCallOptionText: 'Video call',
  probationOfficeOptionText: 'In-person meeting - probation office',
  somewhereElseOptionText: 'In-person meeting - somewhere else',
  yesText: 'Yes',
  noText: 'No',
}))
