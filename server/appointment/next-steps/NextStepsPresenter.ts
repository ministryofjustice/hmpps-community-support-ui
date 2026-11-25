import { GovukFrontendTextarea } from '@govuk-frontend'
import { IcsFeedbackSubmission } from '@community-support-api'
import PresenterBase from '../../presenter/presenterBase'
import { ErrorMiddlewareErrors } from '../../@types/express'
import { NextStepsViewModel } from './NextStepsViewModel'

export default class NextStepsPresenter extends PresenterBase<NextStepsViewModel> {
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
    value = '',
    error = '',
  ): GovukFrontendTextarea {
    return {
      id,
      name,
      label: { text: label, classes: 'govuk-label--m' },
      value,
      attributes: { 'data-testid': id },
      errorMessage: error ? { text: error } : undefined,
    }
  }

  buildViewModel(): NextStepsViewModel {
    const content = this.globalContent().icsFeedback.id.nextSteps
    const fieldErrors = this.errors?.messages || {}

    return {
      pageTitle: content.pageTitle,
      pageHeader: content.pageHeader,
      plannedForNextSession: this.buildTextarea(
        'plannedForNextSession',
        'plannedForNextSession',
        content.plannedForNextSessionLabel,
        this.data?.plannedForNextSession ?? '',
        fieldErrors.plannedForNextSession?.text ?? '',
      ),
      actionsBeforeNextSession: this.buildTextarea(
        'actionsBeforeNextSession',
        'actionsBeforeNextSession',
        content.actionsBeforeNextSessionLabel.replace('{{ firstname }}', this.firstName),
        this.data?.actionsBeforeNextSession ?? '',
        fieldErrors.actionsBeforeNextSession?.text ?? '',
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
