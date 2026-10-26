import { Response } from 'express'
import { GovukFrontendErrorMessage, GovukFrontendSummaryList } from '@govuk-frontend'
import { ExistingSupportNeedsBffResponseDto } from '@community-support-api'
import PresenterBase from '../../presenter/presenterBase'
import {
  IdentifiedAdditionalNeedsContent,
  IdentifiedAdditionalNeedsViewModel,
  IdentifiedAdditionalNeedsFormData,
  DidYouIdentityRadioItemsContent,
  DidYouIdentityRadioContent,
} from './IdentifiedAddionalNeedsViewModel'
import {
  GovukFrontendRadiosItemWithConditional,
  GovukFrontendRadiosWithConditional,
} from '../../@types/govukFrontend/derived'
import { components } from '../../@types/communitySupportApi/imported'
import { escapeHtml } from '../../utils/utils'
import { ErrorMiddlewareErrors } from '../../@types/express'
import { govFrontendSummaryListRow } from '../../utils/viewUtils'

export type ExistingSupportNeedsPresenterData = Pick<
  ExistingSupportNeedsBffResponseDto,
  'supportNeeds' | 'referralFirstName'
>
export default class IdentifiedAdditionalSupportNeedsPresenter extends PresenterBase<
  IdentifiedAdditionalNeedsViewModel,
  IdentifiedAdditionalNeedsContent
> {
  constructor(
    private readonly caseRefId: string,
    private readonly data: ExistingSupportNeedsPresenterData,
    private readonly identifiedAdditionalNeeds: components['schemas']['IdentifiedAdditionalNeedsRequest'],
    private readonly validationErrors?: ErrorMiddlewareErrors,
  ) {
    super()
  }

  private buildIdentityTextArea(
    content: DidYouIdentityRadioItemsContent,
    formData: IdentifiedAdditionalNeedsFormData,
    errorMessage?: GovukFrontendErrorMessage,
  ): string {
    const errorText: string = errorMessage ? errorMessage.text : undefined
    const errorHtml: string = errorText
      ? `
    <p id="${content.identityDetailsName}Error" class="govuk-error-message">
      <span class="govuk-visually-hidden">Error:</span> ${errorText}
    </p>`
      : ''
    return `
    <div class="govuk-form-group ${errorText ? 'govuk-form-group--error' : ''}" data-testid=${content.identityDetailsName} >
      <h1 class="govuk-label-wrapper govuk-label">
        <label class="govuk-label govuk-label--s"
          id=${content.identityDetailsName}Label>
          ${content.identityDetailsLabel.replace('{{ firstname }}', this.data.referralFirstName)}
        </label>
      </h1>
      ${errorHtml}
      <textarea class="govuk-textarea" id=${content.identityDetailsName}Input name=${content.identityDetailsName} rows="5" spellcheck="false" >${escapeHtml(formData.identityDetails) ?? ''}</textarea>
    </div>`
  }

  private buildDidYouIdentityRadioItems(
    content: DidYouIdentityRadioItemsContent,
    formData: IdentifiedAdditionalNeedsFormData,
    errorMessage?: GovukFrontendErrorMessage,
  ): GovukFrontendRadiosItemWithConditional[] {
    const htmlString = this.buildIdentityTextArea(content, formData, errorMessage)
    return [
      {
        id: 'YesRadio',
        value: content.yesText,
        text: content.yesText,
        checked: formData.didYouIdentity === true,
        conditional: { html: htmlString },
      },
      {
        id: 'NoRadio',
        value: content.noText,
        text: content.noText,
        checked: formData.didYouIdentity === false,
      },
    ]
  }

  private buildDidYouIdentityRadio(
    content: DidYouIdentityRadioContent,
    formData: IdentifiedAdditionalNeedsFormData,
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
      errorMessage: errorMessages.didYouIdentity,
      attributes: { 'data-testid': content.name },
      items: this.buildDidYouIdentityRadioItems(content.items, formData, errorMessages.identityDetails),
    }
  }

  private buildExistingSuppportNeedsDetails = (
    cardTitle: string,
    exisitngData: ExistingSupportNeedsPresenterData,
  ): GovukFrontendSummaryList | undefined => {
    if (!exisitngData.supportNeeds || exisitngData.supportNeeds.length === 0) return undefined

    return {
      card: {
        title: {
          text: cardTitle,
        },
      },
      rows: exisitngData.supportNeeds.map(need => govFrontendSummaryListRow(need.needName, need.needDetails)),
      attributes: { 'data-testid': 'exisiting-support-needs-details' },
    }
  }

  buildViewModel(res: Response): IdentifiedAdditionalNeedsViewModel {
    const content = this.buildStaticContent(res)
    const formData: IdentifiedAdditionalNeedsFormData = this.identifiedAdditionalNeeds
      ? {
          didYouIdentity: this.identifiedAdditionalNeeds.didYouIdentity,
          identityDetails: this.identifiedAdditionalNeeds.identityDetails,
        }
      : {}

    return {
      pageTitle: content.pageTitle,
      pageHeader: content.pageHeader,
      pageSubHeader: content.pageSubHeader.replace('{{ firstname }}', this.data.referralFirstName),
      firstname: this.data.referralFirstName,
      didYouIdentityRadio: this.buildDidYouIdentityRadio(
        content.didYouIdentityRadio,
        formData,
        this.validationErrors?.messages,
      ),
      submitButton: { text: content.submitButtonText },
      submitHref: `/ics-feedback/${this.caseRefId}/identified-additional-needs`,
      backLink: { href: content.backLinkHref.replace('{{ id }}', this.caseRefId) },
      existingSupportNeedsDetails: this.buildExistingSuppportNeedsDetails(content.cardTitle, this.data),
      formData,
    }
  }

  getTemplatePath(): string {
    return 'appointment/identifiedAdditionalNeeds'
  }
}
