import { Factory } from 'fishery'
import { ScheduleIcsContent } from '../../appointment/schedule-ics/scheduleIcsViewModel'

class ScheduleIcsContentFactory extends Factory<ScheduleIcsContent> {}

export default ScheduleIcsContentFactory.define(({ transientParams }) => ({
  pageHeader: transientParams.pageHeader || 'Schedule the ICS',
  submitButtonText: transientParams.submitButtonText || 'continue',
  submitHref: '/referral/{{ caseRef }}/appointment/schedule-ics',
  backLink: '/progress/{{ caseRef }}',
}))
