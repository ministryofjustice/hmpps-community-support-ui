import { Response } from 'express'
import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendTextarea } from '@govuk-frontend'
import { IcsFeedbackSubmission } from '@community-support-api'
import PresenterBase from '../../presenter/presenterBase'
import { ErrorMiddlewareErrors } from '../../@types/express'

export interface HowTheyTriedToContactThePersonFormViewModel {
  textarea: GovukFrontendTextarea
  button: GovukFrontendButton
}

export interface HowTheyTriedToContactThePersonViewModel {
  form: HowTheyTriedToContactThePersonFormViewModel
  backLink: GovukFrontendBackLink
}

interface TextAreaContent {
  id: string
  name: string
  label: string
  hint: string
  error: string
  rows: string
}

interface FormContent {
  textarea: TextAreaContent
  submitButtonText: string
}

export interface HowTheyTriedToContactThePersonContent {
  feedbackForm: FormContent
  backLink: string
}

export default class HowTheyTriedToContactThePersonPresenter extends PresenterBase<
  HowTheyTriedToContactThePersonViewModel,
  HowTheyTriedToContactThePersonContent
> {
  constructor(
    private readonly caseRefId: string,
    private readonly firstName: string,
    private feedbackData: IcsFeedbackSubmission,
  ) {
    super()
  }

  private buildForm(
    content: FormContent,
    errors: ErrorMiddlewareErrors | undefined,
  ): HowTheyTriedToContactThePersonFormViewModel {
    const fieldError = errors?.messages[content.textarea.id]
    const fieldData = this.feedbackData?.record?.noAttendanceInformation || ''
    return {
      textarea: {
        id: content.textarea.id,
        name: content.textarea.name,
        label: {
          text: content.textarea.label.replace('{{ firstname }}', this.firstName),
          classes: 'govuk-label--l',
          isPageHeading: true,
          attributes: { 'data-testid': 'textarea-label' },
        },
        hint: {
          text: content.textarea.hint,
          attributes: { 'data-testid': 'textarea-hint' },
        },
        value: fieldData,
        rows: content.textarea.rows,
        attributes: { 'data-testid': 'textarea-input' },
        errorMessage: fieldError,
      },
      button: { text: content.submitButtonText },
    }
  }

  buildPageContent(res: Response): HowTheyTriedToContactThePersonViewModel {
    const content = this.buildStaticContent(res)
    return {
      form: this.buildForm(content.feedbackForm, res.locals?.errors),
      backLink: { href: content.backLink.replace('{{ id }}', this.caseRefId) },
    }
  }

  getTemplatePath(): string {
    return 'appointment/howTheyTriedToContactThePerson'
  }
}
