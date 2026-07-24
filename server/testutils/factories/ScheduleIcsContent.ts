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
    AMorPM: 'AM or PM',
  },
  howSessionTakePlace: {
    label: 'How will the session take place?',
    hint: 'Select one option.',
    radioItems: {
      phone: {
        text: 'Phone call',
        label: 'Why is this session not in person?',
      },
      video: {
        text: 'Video call',
        label: 'Why is this session not in person?',
      },
      prison: {
        text: 'In-person meeting - prison establishment',
        label: 'Select prison',
      },
      probation: {
        text: 'In-person meeting - probation office',
        label: 'Select a probation office',
      },
      somewhereElse: {
        text: 'In-person meeting - somewhere else',
        addressLabels: {
          address1: 'Address line 1',
          address2: 'Address line 2 (optional)',
          townOrCity: 'Town or city',
          county: 'County (optional)',
          postcode: 'Postcode',
        },
      },
    },
  },
  informed: {
    label: 'How was {{ firstname }} informed about the session?',
    hint: 'Select all that apply.',
    selectionItems: {
      phone: 'Phone call',
      text: 'Text message',
      email: 'Email',
      other: {
        text: 'Other',
        label: 'Other method of contact',
      },
    },
  },
  submitButtonText: transientParams.submitButtonText || 'continue',
  submitHref: '/referral/{{ caseRef }}/appointment/schedule-ics',
  backLink: '/progress/{{ caseRef }}',
}))
