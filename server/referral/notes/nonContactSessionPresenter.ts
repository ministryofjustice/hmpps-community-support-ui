import { ErrorMiddlewareErrors } from '../../@types/express'
import PresenterBase from '../../presenter/presenterBase'
import { NonContactSessionModel } from './nonContactSessionModel'

export default class NonContactSessionPresenter extends PresenterBase<NonContactSessionModel> {
  constructor(
    private readonly caseReference: string,
    private readonly formData: Record<string, string>,
    private readonly validationErrors?: ErrorMiddlewareErrors,
  ) {
    super()
  }

  protected getTemplatePath(): string {
    return 'notes/nonContactSession.njk'
  }

  buildViewModel(): NonContactSessionModel {
    const content = this.globalContent().referral.id.notes['non-contact-session-details']
    const messages = this.validationErrors?.messages
    return {
      backLink: content.backLink.replace('{{ id }}', this.caseReference),
      pageHeader: content.pageHeader,
      date: {
        id: 'date',
        name: 'date',
        label: {
          text: content.date.label,
          classes: 'govuk-!-font-weight-bold',
        },
        hint: { text: content.date.hint },
        value: this.formData.date,
        errorMessage: messages.date,
      },
      time: {
        id: 'time',
        namePrefix: 'time',
        fieldset: {
          legend: {
            text: content.time.label,
            classes: 'govuk-!-font-weight-bold',
          },
        },
        attributes: {},
        items: [
          {
            name: 'Hour',
            classes: 'govuk-input--width-2',
            value: this.formData['time-Hour'],
          },
          {
            name: 'Minute',
            classes: 'govuk-input--width-2',
            value: this.formData['time-Minute'],
          },
        ],
        errorMessages: [messages['time-Hour'], messages['time-Minutes']].filter(item => item !== undefined),
      },
      title: {
        name: 'title',
        label: {
          text: content.title.label,
          classes: 'govuk-!-font-weight-bold',
        },
        value: this.formData.title,
        errorMessage: messages.title,
      },
      activity: {
        name: 'activity',
        maxlength: content.activity.maxLength.toString(),
        maxwords: '',
        label: {
          text: content.activity.label,
          classes: 'govuk-!-font-weight-bold',
        },
        value: this.formData.activity,
        errorMessage: messages.activity,
      },
      submitButton: { text: content.buttonText },
    }
  }
}
