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
  whatDidYouDoTextarea: GovukFrontendTextarea
  behaviourTextarea: GovukFrontendTextarea
  strengthsIdentifiedTextarea: GovukFrontendTextarea
  button: GovukFrontendButton
}

export interface SessionFeedbackViewModel {
  errorSummary?: GovukFrontendErrorSummary
  pageTitle: string
  pageHeader: string
  description?: string
  label: string
  form?: SessionFeedbackFormViewModel
  backLink: GovukFrontendBackLink
  submitHref: string
}

interface FormContent {
  label: string
  whatDidYouDoTextarea: TextareaContent
  behaviourTextarea: TextareaContent
  strengthsIdentifiedTextarea: TextareaContent
  submitButtonText: string
}

interface TextareaContent {
  id: string
  name: string
  label: string
  hint: string
  error: string
  rows?: string
}

export interface SessionFeedbackContent {
  pageTitle: string
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
    private readonly firstName: string = '',
  ) {
    super()
  }

  private buildTextarea(
    content: TextareaContent,
    value: string = '',
    errors: FormErrors = null,
  ): GovukFrontendTextarea {
    const fieldError = errors?.messages[content.name] || errors?.messages[content.id]
    return {
      id: content.id,
      name: content.name,
      label: { text: content.label, classes: 'govuk-label--m' },
      hint: { text: content.hint },
      value,
      rows: content.rows,
      attributes: { 'data-testid': content.id },
      errorMessage: fieldError,
    }
  }

  private buildForm(content: FormContent, errors: FormErrors = null): SessionFeedbackFormViewModel | undefined {
    return {
      whatDidYouDoTextarea: this.buildTextarea(
        content.whatDidYouDoTextarea,
        this.formData?.sessionFeedback?.whatHappened ?? '',
        errors,
      ),
      behaviourTextarea: this.buildTextarea(
        {
          ...content.behaviourTextarea,
          label: content.behaviourTextarea.label.replace('{{ firstname }}', this.firstName),
        },
        this.formData?.sessionFeedback?.behaviour ?? '',
        errors,
      ),
      strengthsIdentifiedTextarea: this.buildTextarea(
        content.strengthsIdentifiedTextarea,
        this.formData?.sessionFeedback?.strengthsIdentified ?? '',
        errors,
      ),
      button: { text: content.submitButtonText },
    }
  }

  buildViewModel(res: Response): SessionFeedbackViewModel {
    const content = this.buildStaticContent(res)
    return {
      pageTitle: content.pageTitle,
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
