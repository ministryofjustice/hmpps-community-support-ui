import { Response } from 'express'
import { AppointmentIcsResponse } from '@community-support-api'
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
import buildAppointmentDetails from './AppointmentDetailsModel'
import {
  GovukFrontendRadiosItemWithConditional,
  GovukFrontendRadiosWithConditional,
} from '../../@types/govukFrontend/derived'
import {
  GovukFrontendBackLink,
  GovukFrontendButton,
  GovukFrontendErrorMessage,
  GovukFrontendFieldset,
  GovukFrontendInput,
  GovukFrontendTextarea,
} from '@govuk-frontend'
import nunjucks from 'nunjucks'
import {
  RecordSessionDetailsError,
  RecordSessionDetailsErrorMessages,
} from '../../validation/RecordSessionDetailsFormData'

export default class RecordSessionDetailsPresenter extends PresenterBase<RecordSessionDetailsViewModel, RecordSessionDetailsContent> {
  constructor(
    private readonly caseRefId: string,
    private readonly data: AppointmentIcsResponse,
    private readonly session: {
      wasPersonLate?: boolean | null
      lateReason?: string | null
      duration?: { hours: number; minutes?: number | null } | null
    },
    private readonly validationErrors?: RecordSessionDetailsError,
  ) {
    super()
  }

  private buildLateReasonTextArea(
    content: WasPersonLateRadioItemsContent,
    formData: RecordSessionDetailsFormData,
  ): string {
    const textArea: GovukFrontendTextarea = {
      id: content.lateReasonName,
      name: content.lateReasonName,
      value: formData.lateReason,
      spellcheck: false,
      attributes: { 'data-testid': content.lateReasonName },
      label: {
        text: content.lateReasonLabel.replace('{{ firstname }}', this.data.referralFirstName),
        classes: 'govuk-label--s',
        attributes: { 'data-testid': `${content.lateReasonName}Label` },
        isPageHeading: true,
      },
    }
    return nunjucks.renderString(
      '{% from "govuk/components/textarea/macro.njk" import govukTextarea %}{{ govukTextarea(content.textArea) }}',
      { content: { textArea } },
    )
  }

  private buildWasPersonLateRadioItems(
    content: WasPersonLateRadioItemsContent,
    formData: RecordSessionDetailsFormData,
  ): GovukFrontendRadiosItemWithConditional[] {
    return [
      {
        id: 'YesRadio',
        value: content.yesText,
        text: content.yesText,
        checked: formData.wasPersonLate === true,
        conditional: { html: this.buildLateReasonTextArea(content, formData) },
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
    errorMessages?: RecordSessionDetailsErrorMessages,
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
      items: this.buildWasPersonLateRadioItems(content.items, formData),
    }
  }

  private buildSessionDurationFieldset(
    content: SessionDurationTimeInputFieldsetContent
  ): GovukFrontendFieldset {
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
        value: formData['sessionDuration-hours']?.toString(),
        inputmode: 'numeric',
        classes: 'govuk-input govuk-date-input__input govuk-input--width-2',
      },
    ]
  }

  private buildSessionDurationTimeInput(
    content: SessionDurationTimeInputContent,
    formData: RecordSessionDetailsFormData,
    errorMessages?: RecordSessionDetailsErrorMessages,
  ): TimeInput {
    let errors: GovukFrontendErrorMessage[] = []
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
