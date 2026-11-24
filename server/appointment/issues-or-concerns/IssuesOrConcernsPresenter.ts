import { GovukFrontendRadios, GovukFrontendRadiosItem, GovukFrontendTextarea } from '@govuk-frontend'
import PresenterBase from '../../presenter/presenterBase'
import {
  IssuesOrConcernsContent,
  IssuesOrConcernsFormData,
  IssuesOrConcernsViewModel,
  NotifyProbationPractitionerRadioContent,
} from './IssuesOrConcernsViewModel'
import { ErrorMiddlewareErrors } from '../../@types/express'

export default class IssuesOrConcernsPresenter extends PresenterBase<IssuesOrConcernsViewModel> {
  constructor(
    private readonly caseRefId: string,
    private readonly firstName: string,
    private readonly data?: IssuesOrConcernsFormData,
    private readonly errors?: ErrorMiddlewareErrors,
  ) {
    super()
  }

  private buildIssuesTextArea(content: IssuesOrConcernsContent): GovukFrontendTextarea {
    return {
      id: 'issuesOrConcerns',
      name: 'issuesOrConcerns',
      label: {
        text: content.issuesOrConcernsLabel,
        classes: 'govuk-label--m',
        isPageHeading: false,
        attributes: { 'data-testid': 'textarea-label' },
      },
      hint: {
        text: content.issuesOrConcernsHint.replace('{{ firstname }}', this.firstName),
        attributes: { 'data-testid': 'textarea-hint' },
      },
      value: this.data?.identified || '',
      attributes: { 'data-testid': 'textarea-input' },
      errorMessage: this.errors?.messages?.issuesOrConcerns || '',
    }
  }

  private buildNotifyProbationPractitionerRadios(
    content: NotifyProbationPractitionerRadioContent,
  ): GovukFrontendRadios {
    const items: GovukFrontendRadiosItem[] = [
      {
        id: 'notifyProbationPractitioner',
        value: content.yesText,
        text: content.yesText,
        checked: this.data?.notifyProbationPractitioner === true,
      },
      {
        id: 'notifyProbationPractitioner-no',
        value: content.noText,
        text: content.noText,
        checked: this.data?.notifyProbationPractitioner === false,
      },
    ]

    return {
      name: 'notifyProbationPractitioner',
      fieldset: {
        attributes: { 'data-testid': 'fieldset-notifyProbationPractitioner' },
        legend: {
          text: content.title,
          isPageHeading: false,
          classes: 'govuk-fieldset__legend govuk-fieldset__legend--m',
        },
      },
      items,
      classes: 'govuk-radios--inline',
      errorMessage: this.errors?.messages?.notifyProbationPractitioner || '',
      attributes: { 'data-testid': 'notifyProbationPractitioner' },
    }
  }

  buildViewModel(): IssuesOrConcernsViewModel {
    const content = this.globalContent().icsFeedback.id.issuesOrConcerns
    return {
      pageTitle: content.pageTitle,
      pageHeader: content.pageHeader,
      issuesOrConcerns: this.buildIssuesTextArea(content),
      notifyProbationPractitioner: this.buildNotifyProbationPractitionerRadios(content.notifyProbationPractitioner),
      submitButton: { text: content.submitButtonText },
      submitHref: `/ics-feedback/${this.caseRefId}/issues-or-concerns`,
      backLink: { href: content.backLinkHref.replace('{{ id }}', this.caseRefId) },
    }
  }

  getTemplatePath(): string {
    return 'appointment/issuesOrConcerns'
  }
}
