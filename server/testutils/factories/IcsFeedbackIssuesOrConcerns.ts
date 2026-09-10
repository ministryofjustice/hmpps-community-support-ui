import { Factory } from 'fishery'
import { IssuesOrConcernsContent } from '../../appointment/issues-or-concerns/IssuesOrConcernsViewModel'

class IcsFeedbackIssuesOrConcernsFactory extends Factory<IssuesOrConcernsContent> {}

export default IcsFeedbackIssuesOrConcernsFactory.define(({ transientParams }) => ({
  pageTitle: transientParams.pageTitle || 'Issues or concerns – ICS feedback – Community Support',
  pageHeader: transientParams.pageHeader || 'Issues or concerns',
  issuesOrConcernsLabel: transientParams.issuesOrConcernsLabel || 'What issues or concerns did you identify?',
  issuesOrConcernsHint:
    transientParams.issuesOrConcernsHint ||
    'Give details of anything that concerned you about {{ firstname }}, or any issues they raised that might impact their engagement in future sessions.',
  submitButtonText: transientParams.submitButtonText || 'Continue',
  backLinkHref: transientParams.backLinkHref || '/ics-feedback/{{ id }}/session-feedback',
}))
