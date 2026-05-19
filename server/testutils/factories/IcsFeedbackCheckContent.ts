import { Factory } from 'fishery'
import { IcsFeedbackCheckYourAnswersContent } from '../../appointment/check-ics-feedback/icsFeedbackCheckYourAnswersViewModel'

class IcsFeedbackCheckContentFactory extends Factory<IcsFeedbackCheckYourAnswersContent> {}

export default IcsFeedbackCheckContentFactory.define(({ transientParams }) => ({
  pageHeader: transientParams.pageHeader || 'Check your answers before submitting feedback',
  summaryLists: transientParams.summaryLists || [
    {
      summaryTitle: 'Record session attendance',
      rows: [
        {
          text: 'Did the session happen?',
          hint: 'Whether the session happened',
        },
        {
          text: 'How the session took place',
          hint: 'How the session took place',
        },
      ],
    },
    {
      summaryTitle: 'Session details',
      rows: [
        {
          text: 'Was firstname late?',
          hint: 'If firstname was late',
        },
        {
          text: 'Why firstname was late?',
          hint: 'If firstname was late',
        },
        {
          text: 'Session duration',
          hint: 'How long did the session last',
        },
      ],
    },
  ],
  submitButtonText: transientParams.submitButtonText || 'Save and continue',
  submitHref: transientParams.submitHref || '/submit',
  backLinkHref: transientParams.backlinkHref || '/back',
}))
