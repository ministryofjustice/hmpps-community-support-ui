import { Response } from 'express'
import {
  GovukFrontendBackLink,
  GovukFrontendButton,
  GovukFrontendErrorSummary,
  GovukFrontendTextarea,
} from '@govuk-frontend'
import { IcsFeedbackSubmission } from '@community-support-api'
import PresenterBase from '../../presenter/presenterBase'
import { FormErrors } from '../../interfaces/formErrors'

export interface SessionFeedbackFormViewModel {
  label: string
  textarea: GovukFrontendTextarea
  button: GovukFrontendButton
}

export interface SessionFeedbackViewModel {
  errorSummary?: GovukFrontendErrorSummary
  pageHeader: string
  description?: string
  label: string
  form?: SessionFeedbackFormViewModel
  backLink: GovukFrontendBackLink
  submitHref: string
}

interface FormContent {
  label: string
  textarea: {
    id: string
    name: string
    label: string
    hint: string
    error: string
    rows?: string
  }
  submitButtonText: string
}

export interface SessionFeedbackContent {
  pageHeader: string
  description?: string
  label: string
  feedbackForm: FormContent
  backLink: string
}

export default class SessionFeedbackPresenter extends PresenterBase<SessionFeedbackViewModel, SessionFeedbackContent> {
  constructor(
    private readonly caseRefId: string,
    private formData: IcsFeedbackSubmission = null,
  ) {
    super()
  }

  private buildForm(content: FormContent, errors: FormErrors = null): SessionFeedbackFormViewModel | undefined {
    const fieldError = errors?.messages[content.textarea.name] || errors?.messages[content.textarea.id]
    const fieldData = this.formData?.sessionFeedback?.whatHappened ?? ''
    return {
      label: content.textarea.label,
      textarea: {
        id: content.textarea.id,
        name: content.textarea.name,
        label: {},
        hint: { text: content.textarea.hint },
        value: fieldData,
        rows: content.textarea.rows,
        attributes: { 'data-testid': content.textarea.id },
        errorMessage: fieldError,
      },
      button: { text: content.submitButtonText },
    }
  }

  buildViewModel(res: Response): SessionFeedbackViewModel {
    const content = this.buildStaticContent(res)
    return {
      pageHeader: content.pageHeader,
      description: content.description,
      label: content.label,
      form: this.buildForm(content.feedbackForm, res.locals?.errors),
      backLink: { href: content.backLink.replace('{{ id }}', this.caseRefId) },
      submitHref: `/ics-feedback/${this.caseRefId}/session-feedback`,
    }
  }

  getTemplatePath(): string {
    return 'appointment/sessionFeedback'
  }
}
