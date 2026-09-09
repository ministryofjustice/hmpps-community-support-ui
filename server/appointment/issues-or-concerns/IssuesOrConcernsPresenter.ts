import { Response } from 'express'
import { GovukFrontendTextarea } from '@govuk-frontend'
import PresenterBase from '../../presenter/presenterBase'
import {
  IssuesOrConcernsContent,
  IssuesOrConcernsFormData,
  IssuesOrConcernsViewModel,
} from './IssuesOrConcernsViewModel'
import { ErrorMiddlewareErrors } from '../../@types/express'

export default class IssuesOrConcernsPresenter extends PresenterBase<
  IssuesOrConcernsViewModel,
  IssuesOrConcernsContent
> {
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

  buildViewModel(res: Response): IssuesOrConcernsViewModel {
    const content = this.buildStaticContent(res)
    return {
      pageTitle: content.pageTitle,
      pageHeader: content.pageHeader,
      issuesOrConcerns: this.buildIssuesTextArea(content),
      submitButton: { text: content.submitButtonText },
      submitHref: `/ics-feedback/${this.caseRefId}/issues-or-concerns`,
      backLink: { href: content.backLinkHref.replace('{{ id }}', this.caseRefId) },
    }
  }

  getTemplatePath(): string {
    return 'appointment/issuesOrConcerns'
  }
}
