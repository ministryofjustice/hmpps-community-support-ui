import { Factory } from 'fishery'
import { ScheduleIcsContent } from '../../appointment/schedule-ics/scheduleIcsViewModel'

class ScheduleIcsContentFactory extends Factory<ScheduleIcsContent> {}

export default ScheduleIcsContentFactory.define(({ transientParams }) => ({
  pageHeader: transientParams.pageHeader || 'Schedule the ICS',
  date: {
    label: 'What is the date of the session?',
    hint: 'Enter a date, for example 10/7/2025, or select one from the calendar.',
  },
  time: {
    label: 'What is the date of the session?',
    hint: 'Enter a date, for example 10/7/2025, or select one from the calendar.',
  },
  submitButtonText: transientParams.submitButtonText || 'continue',
  submitHref: '/referral/{{ caseRef }}/appointment/schedule-ics',
  backLink: '/progress/{{ caseRef }}',
}))
