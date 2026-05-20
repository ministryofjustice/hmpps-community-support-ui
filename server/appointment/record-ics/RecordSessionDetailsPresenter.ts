import { Response } from 'express'
import {
  GovukFrontendBackLink,
  GovukFrontendButton,
  GovukFrontendErrorMessage,
  GovukFrontendFieldset,
  GovukFrontendInput,
} from '@govuk-frontend'
import PresenterBase from '../../presenter/presenterBase'
import {
  RecordSessionDetailsContent,
  RecordSessionDetailsFormData,
  RecordSessionDetailsViewModel,
  SessionDurationTimeInputContent,
  SessionDurationTimeInputFieldsetContent,
  SessionDurationTimeInputItemsContent,
  TimeInput,
  WasPersonLateRadioContent,
  WasPersonLateRadioItemsContent,
} from './RecordSessionDetailsViewModel'
import buildAppointmentDetails, { RecordSessionAttendancePresenterData } from './AppointmentDetailsModel'
import {
  GovukFrontendRadiosItemWithConditional,
  GovukFrontendRadiosWithConditional,
} from '../../@types/govukFrontend/derived'
import { components } from '../../@types/communitySupportApi/imported'
import { escapeHtml } from '../../utils/utils'
import { ErrorMiddlewareErrors } from '../../@types/express'

export default class RecordSessionDetailsPresenter extends PresenterBase<
  RecordSessionDetailsViewModel,
  RecordSessionDetailsContent
> {
  constructor(
    private readonly caseRefId: string,
    private readonly data: RecordSessionAttendancePresenterData,
    private readonly session: components['schemas']['SessionDetailsRequest'],
    private readonly validationErrors?: ErrorMiddlewareErrors,
  ) {
    super()
  }

  private buildLateReasonTextArea(
    content: WasPersonLateRadioItemsContent,
    formData: RecordSessionDetailsFormData,
    errorMessage?: GovukFrontendErrorMessage,
  ): string {
    const errorText: string = errorMessage ? errorMessage.text : undefined
    const errorHtml: string = errorText
      ? `
    <p id="${content.lateReasonName}Error" class="govuk-error-message">
      <span class="govuk-visually-hidden">Error:</span> ${errorText}
    </p>`
      : ''
    return `
    <div class="govuk-form-group ${errorText ? 'govuk-form-group--error' : ''}" data-testid=${content.lateReasonName} >
      <h1 class="govuk-label-wrapper">
        <label class="govuk-label govuk-label--s"
          id=${content.lateReasonName}Label>
          ${content.lateReasonLabel.replace('{{ firstname }}', this.data.referralFirstName)}
        </label>
      </h1>
      ${errorHtml}
      <textarea class="govuk-textarea" id=${content.lateReasonName}Input name=${content.lateReasonName} rows="5" spellcheck="false" >${escapeHtml(formData.lateReason) ?? ''}</textarea>
    </div>`
  }

  private buildWasPersonLateRadioItems(
    content: WasPersonLateRadioItemsContent,
    formData: RecordSessionDetailsFormData,
    errorMessage?: GovukFrontendErrorMessage,
  ): GovukFrontendRadiosItemWithConditional[] {
    const htmlString = this.buildLateReasonTextArea(content, formData, errorMessage)
    return [
      {
        id: 'YesRadio',
        value: content.yesText,
        text: content.yesText,
        checked: formData.wasPersonLate === true,
        conditional: { html: htmlString },
      },
      {
        id: 'NoRadio',
        value: content.noText,
        text: content.noText,
        checked: formData.wasPersonLate === false,
      },
    ]
  }

  private buildWasPersonLateRadio(
    content: WasPersonLateRadioContent,
    formData: RecordSessionDetailsFormData,
    errorMessages?: Record<string, GovukFrontendErrorMessage>,
  ): GovukFrontendRadiosWithConditional {
    return {
      name: content.name,
      fieldset: {
        attributes: { 'data-testid': `fieldset-${content.name}` },
        legend: {
          text: content.title.replace('{{ firstname }}', this.data.referralFirstName),
          isPageHeading: false,
          classes: 'govuk-fieldset__legend govuk-fieldset__legend--m',
        },
      },
      errorMessage: errorMessages.wasPersonLate,
      attributes: { 'data-testid': content.name },
      items: this.buildWasPersonLateRadioItems(content.items, formData, errorMessages.lateReason),
    }
  }

  private buildSessionDurationFieldset(content: SessionDurationTimeInputFieldsetContent): GovukFrontendFieldset {
    return {
      classes: 'govuk-fieldset',
      attributes: { 'data-testid': content.id },
      legend: {
        text: content.text,
        classes: 'govuk-fieldset__legend govuk-fieldset__legend--m',
        isPageHeading: false,
      },
    }
  }

  private buildSessionDurationTimeInputItems(
    content: SessionDurationTimeInputItemsContent,
    formData: RecordSessionDetailsFormData,
  ): GovukFrontendInput[] {
    return [
      {
        name: content.hoursName,
        label: { text: content.hoursLabel, classes: 'govuk-date-input__label' },
        value: formData['sessionDuration-hours']?.toString(),
        inputmode: 'numeric',
        classes: 'govuk-input govuk-date-input__input govuk-input--width-2',
      },
      {
        name: content.minutesName,
        label: { text: content.minutesLabel, classes: 'govuk-date-input__label' },
        value: formData['sessionDuration-minutes']?.toString(),
        inputmode: 'numeric',
        classes: 'govuk-input govuk-date-input__input govuk-input--width-2',
      },
    ]
  }

  private buildSessionDurationTimeInput(
    content: SessionDurationTimeInputContent,
    formData: RecordSessionDetailsFormData,
    errorMessages?: Record<string, GovukFrontendErrorMessage>,
  ): TimeInput {
    const errors: GovukFrontendErrorMessage[] = []
    if (errorMessages['sessionDuration-hours']) {
      errors.push(errorMessages['sessionDuration-hours'])
    }
    if (errorMessages['sessionDuration-minutes']) {
      errors.push(errorMessages['sessionDuration-minutes'])
    }
    return {
      id: content.id,
      errorMessages: errors,
      fieldset: this.buildSessionDurationFieldset(content.fieldset),
      attributes: { 'data-testid': content.id },
      namePrefix: content.id,
      items: this.buildSessionDurationTimeInputItems(content.items, formData),
    }
  }

  private buildSubmitButton(buttonText: string): GovukFrontendButton {
    return {
      text: buttonText,
      classes: 'govuk-!-margin-top-6',
    }
  }

  private buildBackLink(href: string): GovukFrontendBackLink {
    return {
      href: href.replace('{{ id }}', this.caseRefId),
    }
  }

  buildPageContent(res: Response): RecordSessionDetailsViewModel {
    const content: RecordSessionDetailsContent = this.buildStaticContent(res)
    const formData: RecordSessionDetailsFormData = this.session
      ? {
          wasPersonLate: this.session.wasPersonLate,
          lateReason: this.session.lateReason,
          'sessionDuration-hours': this.session.duration?.hours,
          'sessionDuration-minutes': this.session.duration?.minutes,
        }
      : {}

    return {
      pageHeader: content.pageHeader,
      firstName: this.data.referralFirstName,
      appointment: buildAppointmentDetails(content.appointmentDetails, this.data),
      wasPersonLateRadio: this.buildWasPersonLateRadio(
        content.wasPersonLateRadio,
        formData,
        this.validationErrors?.messages,
      ),
      sessionDurationTimeInput: this.buildSessionDurationTimeInput(
        content.sessionDurationTimeInput,
        formData,
        this.validationErrors?.messages,
      ),
      submitButton: this.buildSubmitButton(content.submitButtonText),
      submitHref: `/ics-feedback/${this.caseRefId}/session-details`,
      backLink: this.buildBackLink(content.backLinkHref),
      formData,
    }
  }

  getTemplatePath(): string {
    return 'appointment/recordSessionDetails'
  }
}
