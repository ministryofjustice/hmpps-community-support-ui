import { Response } from 'express'
import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendTextarea } from '@govuk-frontend'
import PresenterBase from '../../presenter/presenterBase'
import { ErrorMiddlewareErrors } from '../../@types/express'

export interface HowTheyTriedToContactThePersonFormViewModel {
  contactAttemptsTextarea: GovukFrontendTextarea
  reasonsForNonAttendanceTextarea: GovukFrontendTextarea
  button: GovukFrontendButton
}

export interface HowTheyTriedToContactThePersonViewModel {
  form: HowTheyTriedToContactThePersonFormViewModel
  backLink: GovukFrontendBackLink
  pageHeading: string
}

export interface HowTheyTriedToContactThePersonFormData {
  howTheyTriedToContactThePerson?: string
  reasonsTheyDidNotAttend?: string
}

interface TextAreaContent {
  id: string
  name: string
  label: string
  hint?: string
  rows: string
}

interface FormContent {
  contactAttemptsTextarea: TextAreaContent
  reasonsForNonAttendanceTextarea: TextAreaContent
  submitButtonText: string
}

interface TextareaOptions {
  dataTestId: string
  labelClasses: string
  label?: string
}

export default class HowTheyTriedToContactThePersonPresenter extends PresenterBase<HowTheyTriedToContactThePersonViewModel> {
  constructor(
    private readonly caseRefId: string,
    private readonly firstName: string,
    private readonly submittedFormData?: HowTheyTriedToContactThePersonFormData,
  ) {
    super()
  }

  private buildTextarea(
    content: TextAreaContent,
    value: string,
    errors: ErrorMiddlewareErrors | undefined,
    options: TextareaOptions,
  ): GovukFrontendTextarea {
    return {
      id: content.id,
      name: content.name,
      label: {
        text: options.label ?? content.label,
        classes: options.labelClasses,
        attributes: { 'data-testid': `${options.dataTestId}-label` },
      },
      hint: content.hint
        ? {
            text: content.hint,
            attributes: { 'data-testid': `${options.dataTestId}-hint` },
          }
        : undefined,
      value,
      rows: content.rows,
      attributes: { 'data-testid': `${options.dataTestId}-input` },
      errorMessage: errors?.messages[content.id],
    }
  }

  private buildForm(
    content: FormContent,
    errors: ErrorMiddlewareErrors | undefined,
  ): HowTheyTriedToContactThePersonFormViewModel {
    return {
      contactAttemptsTextarea: this.buildTextarea(
        content.contactAttemptsTextarea,
        this.submittedFormData?.howTheyTriedToContactThePerson ?? '',
        errors,
        {
          dataTestId: 'contact-textarea',
          labelClasses: 'govuk-label--m',
          label: content.contactAttemptsTextarea.label.replace('{{ firstname }}', this.firstName),
        },
      ),
      reasonsForNonAttendanceTextarea: this.buildTextarea(
        content.reasonsForNonAttendanceTextarea,
        this.submittedFormData?.reasonsTheyDidNotAttend ?? '',
        errors,
        {
          dataTestId: 'reasons-textarea',
          labelClasses: 'govuk-label--m',
        },
      ),
      button: { text: content.submitButtonText },
    }
  }

  buildViewModel(res: Response): HowTheyTriedToContactThePersonViewModel {
    const content = this.buildStaticContent()['/ics-feedback/:id/how-they-tried-to-contact-the-person']
    return {
      form: this.buildForm(content.feedbackForm, res.locals?.errors),
      backLink: { href: content.backLink.replace('{{ id }}', this.caseRefId) },
      pageHeading: content.pageHeading,
    }
  }

  getTemplatePath(): string {
    return 'appointment/howTheyTriedToContactThePerson'
  }
}
