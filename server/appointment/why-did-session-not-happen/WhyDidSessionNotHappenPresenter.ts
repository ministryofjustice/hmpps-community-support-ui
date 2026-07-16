import { Response } from 'express'
import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendErrorMessage } from '@govuk-frontend'
import PresenterBase from '../../presenter/presenterBase'
import {
  ConditionalTextAreaDetailsContent,
  WhyDidSessionNotHappenContent,
  WhyDidSessionNotHappenRadioContent,
  WhyDidSessionNotHappenRadioItemsContent,
  WhyDidSessionNotHappenViewModel,
} from './WhyDidSessionNotHappenViewModel'
import { components } from '../../@types/communitySupportApi/imported'
import { ErrorMiddlewareErrors } from '../../@types/express'
import {
  GovukFrontendRadiosItemWithConditional,
  GovukFrontendRadiosWithConditional,
} from '../../@types/govukFrontend/derived'
import { escapeHtml } from '../../utils/utils'

export default class WhyDidSessionNotHappenPresenter extends PresenterBase<
  WhyDidSessionNotHappenViewModel,
  WhyDidSessionNotHappenContent
> {
  constructor(
    private readonly caseRefId: string,
    private readonly referralFirstName: string,
    private readonly session: components['schemas']['SessionNotHappenReasonRequest'],
    private readonly validationErrors?: ErrorMiddlewareErrors,
  ) {
    super()
  }

  private buildWhyDidSessionNotHappenDetailsTextArea(
    content: ConditionalTextAreaDetailsContent,
    formData: Partial<components['schemas']['SessionNotHappenReasonRequest']>,
    selected: boolean,
    errorMessage?: GovukFrontendErrorMessage,
  ): string {
    const errorText: string = errorMessage ? errorMessage.text : undefined
    const errorHtml: string = errorText
      ? `
    <p id="${content.name}Error" class="govuk-error-message">
      <span class="govuk-visually-hidden">Error:</span> ${errorText}
    </p>`
      : ''
    return `
    <div class="govuk-form-group ${errorText ? 'govuk-form-group--error' : ''}" data-testid=${content.name} ">
      <div class="govuk-hint"
        id=${content.name}Hint>
        ${content.hint}
      </div>
      ${errorHtml}
      <textarea class="govuk-textarea" id=${content.name}Input name=${content.name} rows="5" spellcheck="false"
        data-testid=${content.name}>${selected ? (escapeHtml(formData.details) ?? '') : ''}</textarea>
    </div>`
  }

  private buildWhyDidSessionNotHappenRadioItems(
    content: WhyDidSessionNotHappenRadioItemsContent,
    formData: Partial<components['schemas']['SessionNotHappenReasonRequest']>,
    errorMessages?: Record<string, GovukFrontendErrorMessage>,
  ): GovukFrontendRadiosItemWithConditional[] {
    const serviceProviderIssueHtml = this.buildWhyDidSessionNotHappenDetailsTextArea(
      content.serviceProviderIssueDetails,
      formData,
      formData.reason === 'SERVICE_PROVIDER_ISSUE',
      errorMessages.serviceProviderIssueDetails,
    )
    const referralCouldNotTakePartHtml = this.buildWhyDidSessionNotHappenDetailsTextArea(
      content.referralCouldNotTakePartDetails,
      formData,
      formData.reason === 'REFERRAL_COULD_NOT_TAKE_PART',
      errorMessages.referralCouldNotTakePartDetails,
    )
    const referralDidNotComplyHtml = this.buildWhyDidSessionNotHappenDetailsTextArea(
      content.referralDidNotComplyDetails,
      formData,
      formData.reason === 'REFERRAL_DID_NOT_COMPLY',
      errorMessages.referralDidNotComplyDetails,
    )
    return [
      {
        id: 'SERVICE_PROVIDER_ISSUE',
        value: 'SERVICE_PROVIDER_ISSUE',
        text: content.serviceProviderIssueText,
        checked: formData.reason === 'SERVICE_PROVIDER_ISSUE',
        conditional: { html: serviceProviderIssueHtml },
      },
      {
        id: 'REFERRAL_COULD_NOT_TAKE_PART',
        value: 'REFERRAL_COULD_NOT_TAKE_PART',
        text: content.referralCouldNotTakePartText.replace('{{ firstname }}', this.referralFirstName),
        checked: formData.reason === 'REFERRAL_COULD_NOT_TAKE_PART',
        conditional: { html: referralCouldNotTakePartHtml },
      },
      {
        id: 'REFERRAL_DID_NOT_COMPLY',
        value: 'REFERRAL_DID_NOT_COMPLY',
        text: content.referralDidNotComplyText.replace('{{ firstname }}', this.referralFirstName),
        checked: formData.reason === 'REFERRAL_DID_NOT_COMPLY',
        conditional: { html: referralDidNotComplyHtml },
      },
    ]
  }

  private buildWhyDidSessionNotHappenRadio(
    content: WhyDidSessionNotHappenRadioContent,
    formData: Partial<components['schemas']['SessionNotHappenReasonRequest']>,
    errorMessages?: Record<string, GovukFrontendErrorMessage>,
  ): GovukFrontendRadiosWithConditional {
    return {
      name: content.name,
      fieldset: { attributes: { 'data-testid': `fieldset-${content.name}` } },
      errorMessage: errorMessages.whyDidSessionNotHappen,
      attributes: { 'data-testid': content.name },
      items: this.buildWhyDidSessionNotHappenRadioItems(content.items, formData, errorMessages),
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

  protected buildViewModel(res: Response): WhyDidSessionNotHappenViewModel {
    const content: WhyDidSessionNotHappenContent = this.buildStaticContent(res)
    const formData: Partial<components['schemas']['SessionNotHappenReasonRequest']> = this.session
      ? {
          reason: this.session.reason,
          details: this.session.details,
        }
      : {}
    return {
      pageHeader: content.pageHeader,
      whyDidSessionNotHappenRadio: this.buildWhyDidSessionNotHappenRadio(
        content.whyDidSessionNotHappenRadio,
        formData,
        this.validationErrors?.messages,
      ),
      submitButton: this.buildSubmitButton(content.submitButtonText),
      submitHref: `/ics-feedback/${this.caseRefId}/why-did-the-session-not-happen`,
      backLink: this.buildBackLink(content.backLinkHref),
      formData,
    }
  }

  getTemplatePath(): string {
    return 'appointment/whyDidSessionNotHappen'
  }
}
