import { Response } from 'express'
import {
  GovukFrontendBackLink,
  GovukFrontendButton,
  GovukFrontendErrorMessage,
  GovukFrontendRadios,
  GovukFrontendRadiosItem,
  GovukFrontendTextarea,
} from '@govuk-frontend'
import PresenterBase from '../../presenter/presenterBase'
import {
  ChangeIcsDetailsReasonContent,
  ChangeIcsDetailsReasonFormData,
  ChangeIcsDetailsReasonViewModel,
  ReasonTextareaContent,
  WhoRequestedRadioContent,
  WhoRequestedRadioItemsContent,
} from './ChangeIcsDetailsReasonViewModel'
import { ErrorMiddlewareErrors } from '../../@types/express'
import { ChangeAppointmentDetails } from './ChangeAppointmentDetails'

export default class ChangeIcsDetailsReasonPresenter extends PresenterBase<
  ChangeIcsDetailsReasonViewModel,
  ChangeIcsDetailsReasonContent
> {
  constructor(
    private readonly caseRefId: string,
    private readonly referralFullName: string,
    private readonly session: Partial<ChangeAppointmentDetails>,
    private readonly validationErrors?: ErrorMiddlewareErrors,
  ) {
    super()
  }

  private buildWhoRequestedRadioItems(
    content: WhoRequestedRadioItemsContent,
    formData: ChangeIcsDetailsReasonFormData,
    radioId: string,
  ): GovukFrontendRadiosItem[] {
    return [
      {
        id: radioId,
        value: content.deliveryPartnerText,
        text: content.deliveryPartnerText,
        checked: formData.requestedBy === content.deliveryPartnerText,
      },
      {
        value: this.referralFullName,
        text: this.referralFullName,
        checked: formData.requestedBy === this.referralFullName,
      },
      {
        value: content.probationPractitionerText,
        text: content.probationPractitionerText,
        checked: formData.requestedBy === content.probationPractitionerText,
      },
    ]
  }

  private buildWhoRequestedRadio(
    content: WhoRequestedRadioContent,
    formData: ChangeIcsDetailsReasonFormData,
    errorMessages?: Record<string, GovukFrontendErrorMessage>,
  ): GovukFrontendRadios {
    return {
      name: content.name,
      fieldset: {
        legend: {
          text: content.title,
          isPageHeading: false,
          classes: 'govuk-fieldset__legend--m',
        },
        attributes: { 'data-testid': `fieldset-${content.name}` },
      },
      hint: { text: content.hint },
      errorMessage: errorMessages.requestedBy,
      attributes: { 'data-testid': content.name },
      items: this.buildWhoRequestedRadioItems(content.items, formData, content.name),
    }
  }

  private buildReasonTextarea(
    content: ReasonTextareaContent,
    formData: ChangeIcsDetailsReasonFormData,
    errorMessages: Record<string, GovukFrontendErrorMessage>,
  ): GovukFrontendTextarea {
    return {
      id: content.name,
      name: content.name,
      label: {
        text: content.label,
        classes: 'govuk-label--m',
      },
      value: formData.reasonForChange,
      formGroup: { attributes: { 'data-testid': content.name } },
      errorMessage: errorMessages.reasonForChange,
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

  protected buildPageContent(res: Response): ChangeIcsDetailsReasonViewModel {
    const content: ChangeIcsDetailsReasonContent = this.buildStaticContent(res)
    const formData: ChangeIcsDetailsReasonFormData = this.session
      ? {
          requestedBy: this.session.requestedBy,
          reasonForChange: this.session.reasonForChange,
        }
      : {}
    return {
      pageHeader: content.pageHeader,
      serviceName: content.serviceName,
      whoRequestedRadios: this.buildWhoRequestedRadio(
        content.whoRequestedRadio,
        formData,
        this.validationErrors?.messages,
      ),
      reasonTextarea: this.buildReasonTextarea(content.reasonTextarea, formData, this.validationErrors?.messages),
      submitButton: this.buildSubmitButton(content.submitButtonText),
      submitHref: `/referral/${this.caseRefId}/ics-change-details/reason`,
      backLink: this.buildBackLink(content.backLinkHref),
      formData,
    }
  }

  protected getTemplatePath(): string {
    return 'appointment/rescheduleIcsAppointmentReason'
  }
}
