import { Response } from 'express'
import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendTextarea } from '@govuk-frontend'
import PresenterBase from '../../presenter/presenterBase'
import {
  ConditionalHtml,
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
  ): GovukFrontendTextarea {
    return {
      id: content.name,
      name: content.name,
      label: {
        text: content.label,
      },
      rows: '5',
      formGroup: { attributes: { 'data-testid': content.name } },
      errorMessage: this.validationErrors?.messages[content.name] ?? null,
      value: selected ? (formData.details ?? '') : '',
    }
  }

  private buildWhyDidSessionNotHappenRadioItems(
    content: WhyDidSessionNotHappenRadioItemsContent,
    formData: Partial<components['schemas']['SessionNotHappenReasonRequest']>,
    conditionalHtml: ConditionalHtml,
  ): GovukFrontendRadiosItemWithConditional[] {
    return [
      {
        id: 'SERVICE_PROVIDER_ISSUE',
        value: 'SERVICE_PROVIDER_ISSUE',
        text: content.serviceProviderIssueText,
        hint: { text: content.serviceProviderIssueHint },
        checked: formData.reason === 'SERVICE_PROVIDER_ISSUE',
        conditional: { html: conditionalHtml.serviceProviderIssue },
      },
      {
        id: 'REFERRAL_COULD_NOT_TAKE_PART',
        value: 'REFERRAL_COULD_NOT_TAKE_PART',
        text: content.referralCouldNotTakePartText.replace('{{ firstname }}', this.referralFirstName),
        hint: { text: content.referralCouldNotTakePartHint },
        checked: formData.reason === 'REFERRAL_COULD_NOT_TAKE_PART',
        conditional: { html: conditionalHtml.referralCouldNotTakePart },
      },
      {
        id: 'REFERRAL_DID_NOT_COMPLY',
        value: 'REFERRAL_DID_NOT_COMPLY',
        text: content.referralDidNotComplyText.replace('{{ firstname }}', this.referralFirstName),
        hint: { text: content.referralDidNotComplyHint },
        checked: formData.reason === 'REFERRAL_DID_NOT_COMPLY',
        conditional: { html: conditionalHtml.referralDidNotComply },
      },
    ]
  }

  private buildWhyDidSessionNotHappenRadio(
    content: WhyDidSessionNotHappenRadioContent,
    formData: Partial<components['schemas']['SessionNotHappenReasonRequest']>,
    conditionalHtml: ConditionalHtml,
  ): GovukFrontendRadiosWithConditional {
    return {
      name: content.name,
      fieldset: { attributes: { 'data-testid': `fieldset-${content.name}` } },
      errorMessage: this.validationErrors?.messages[content.name] ?? null,
      attributes: { 'data-testid': content.name },
      items: this.buildWhyDidSessionNotHappenRadioItems(content.items, formData, conditionalHtml),
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
      whyDidSessionNotHappenRadio: (conditionalHtml: ConditionalHtml) =>
        this.buildWhyDidSessionNotHappenRadio(content.whyDidSessionNotHappenRadio, formData, conditionalHtml),
      serviceProviderIssueHtmlTextBoxArgs: this.buildWhyDidSessionNotHappenDetailsTextArea(
        content.whyDidSessionNotHappenRadio.items.serviceProviderIssueDetails,
        formData,
        formData.reason === 'SERVICE_PROVIDER_ISSUE',
      ),
      referralCouldNotTakePartHtmlTextBoxArgs: this.buildWhyDidSessionNotHappenDetailsTextArea(
        content.whyDidSessionNotHappenRadio.items.referralCouldNotTakePartDetails,
        formData,
        formData.reason === 'REFERRAL_COULD_NOT_TAKE_PART',
      ),
      referralDidNotComplyHtmlTextBoxArgs: this.buildWhyDidSessionNotHappenDetailsTextArea(
        content.whyDidSessionNotHappenRadio.items.referralDidNotComplyDetails,
        formData,
        formData.reason === 'REFERRAL_DID_NOT_COMPLY',
      ),
      submitButton: this.buildSubmitButton(content.submitButtonText),
      backLink: this.buildBackLink(content.backLinkHref),
      formData,
    }
  }

  getTemplatePath(): string {
    return 'appointment/whyDidSessionNotHappen'
  }
}
