import { Response } from 'express'
import { GovukFrontendTextarea } from '@govuk-frontend'
import { IcsFeedbackSubmission } from '@community-support-api'
import PresenterBase from '../../presenter/presenterBase'
import { ErrorMiddlewareErrors } from '../../@types/express'
import { NextStepsViewModel, NextStepsContent } from './NextStepsViewModel'

export default class NextStepsPresenter extends PresenterBase<NextStepsViewModel, NextStepsContent> {
  constructor(
    private readonly caseRefId: string,
    private readonly firstName: string,
    private readonly data?: IcsFeedbackSubmission['nextSteps'],
    private readonly errors?: ErrorMiddlewareErrors,
  ) {
    super()
  }

  private buildTextarea(
    id: string,
    name: string,
    label: string,
    hint: string,
    value = '',
    error = '',
  ): GovukFrontendTextarea {
    return {
      id,
      name,
      label: { text: label, classes: 'govuk-label--m' },
      hint: { text: hint },
      value,
      attributes: { 'data-testid': id },
      errorMessage: error ? { text: error } : undefined,
    }
  }

  buildViewModel(res: Response): NextStepsViewModel {
    const content = this.buildStaticContent(res)
    const fieldErrors = this.errors?.messages || {}

    return {
      pageTitle: content.pageTitle,
      pageHeader: content.pageHeader,
      plannedForNextSession: this.buildTextarea(
        'plannedForNextSession',
        'plannedForNextSession',
        content.plannedForNextSessionLabel,
        content.plannedForNextSessionHint.replace('{{ firstname }}', this.firstName),
        this.data?.plannedForNextSession ?? '',
        fieldErrors.plannedForNextSession,
      ),
      actionsBeforeNextSession: this.buildTextarea(
        'actionsBeforeNextSession',
        'actionsBeforeNextSession',
        content.actionsBeforeNextSessionLabel.replace('{{ firstname }}', this.firstName),
        content.actionsBeforeNextSessionHint.replace('{{ firstname }}', this.firstName),
        this.data?.actionsBeforeNextSession ?? '',
        fieldErrors.actionsBeforeNextSession,
      ),
      submitButton: { text: content.submitButtonText },
      submitHref: `/ics-feedback/${this.caseRefId}/next-steps`,
      backLink: { href: content.backLinkHref.replace('{{ id }}', this.caseRefId) },
    }
  }

  getTemplatePath(): string {
    return 'appointment/nextSteps'
  }
}
