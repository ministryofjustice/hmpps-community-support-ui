import { Factory } from 'fishery'
import { IssuesOrConcernsContent } from '../../appointment/issues-or-concerns/IssuesOrConcernsViewModel'

class IcsFeedbackIssuesOrConcernsFactory extends Factory<IssuesOrConcernsContent> {}

export default IcsFeedbackIssuesOrConcernsFactory.define(({ transientParams }) => ({
  pageTitle: transientParams.pageTitle || 'Issues or concerns – ICS feedback – Community Support',
  pageHeader: transientParams.pageHeader || 'Issues or concerns',
  issuesOrConcernsLabel:
    transientParams.issuesOrConcernsLabel || 'What issues or concerns did you identify in the ICS?',
  issuesOrConcernsHint:
    transientParams.issuesOrConcernsHint ||
    'Give details of anything that concerned you about {{ firstname }}, or any issues they raised that might impact their engagement in future sessions.',
  notifyProbationPractitioner: transientParams.notifyProbationPractitioner || {
    title: 'Do you want us to send an email to the probation practitioner about the issues or concerns?',
    yesText: 'Yes',
    noText: 'No',
  },
  submitButtonText: transientParams.submitButtonText || 'Continue',
  submitHref: transientParams.submitHref || '/ics-feedback/{{ id }}/identified-additional-needs',
  backLinkHref: transientParams.backLinkHref || '/ics-feedback/{{ id }}/session-feedback',
}))
