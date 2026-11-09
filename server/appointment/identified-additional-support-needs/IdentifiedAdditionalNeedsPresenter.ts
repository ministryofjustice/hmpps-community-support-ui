import { Response } from 'express'
import { GovukFrontendErrorMessage, GovukFrontendSummaryList, GovukFrontendSummaryListRow } from '@govuk-frontend'
import { IcsFeedbackIdentifiedAdditionalSupportNeedsBffResponseDto } from '@community-support-api'
import PresenterBase from '../../presenter/presenterBase'
import {
  IdentifiedAdditionalNeedsContent,
  IdentifiedAdditionalNeedsViewModel,
  IdentifiedAdditionalNeedsFormData,
  DidYouIdentifyRadioItemsContent,
  DidYouIdentifyRadioContent,
} from './IdentifiedAdditionalNeedsViewModel'
import {
  GovukFrontendRadiosItemWithConditional,
  GovukFrontendRadiosWithConditional,
} from '../../@types/govukFrontend/derived'
import { escapeHtml } from '../../utils/utils'
import { ErrorMiddlewareErrors } from '../../@types/express'

export default class IdentifiedAdditionalSupportNeedsPresenter extends PresenterBase<
  IdentifiedAdditionalNeedsViewModel,
  IdentifiedAdditionalNeedsContent
> {
  constructor(
    private readonly caseRefId: string,
    private readonly referralFirstName: string,
    private readonly existingSupportNeedsdata: IcsFeedbackIdentifiedAdditionalSupportNeedsBffResponseDto["referralSupportNeeds"],
    private readonly identifiedAdditionalNeeds: IdentifiedAdditionalNeedsFormData,
    private readonly validationErrors?: ErrorMiddlewareErrors,
  ) {
    super()
  }

  private buildIdentifyTextArea(
    content: DidYouIdentifyRadioItemsContent,
    formData: IdentifiedAdditionalNeedsFormData,
    errorMessage?: GovukFrontendErrorMessage,
  ): string {
    const errorText: string = errorMessage ? errorMessage.text : undefined
    const errorHtml: string = errorText
      ? `
    <p id="${content.identifyDetailsName}Error" class="govuk-error-message">
      <span class="govuk-visually-hidden">Error:</span> ${errorText}
    </p>`
      : ''
    return `
    <div class="govuk-form-group ${errorText ? 'govuk-form-group--error' : ''}" data-testid=${content.identifyDetailsName} >
      <h1 class="govuk-label-wrapper govuk-label">
        <label class="govuk-label govuk-label--s"
          id=${content.identifyDetailsName}Label>
          ${content.identifyDetailsLabel.replace('{{ firstname }}', this.referralFirstName)}
        </label>
      </h1>
      ${errorHtml}
      <textarea class="govuk-textarea" id=${content.identifyDetailsName}Input name=${content.identifyDetailsName} rows="5" spellcheck="false" >${escapeHtml(formData.identifyDetails) ?? ''}</textarea>
    </div>`
  }

  private buildDidYouIdentifyRadioItems(
    content: DidYouIdentifyRadioItemsContent,
    formData: IdentifiedAdditionalNeedsFormData,
    errorMessage?: GovukFrontendErrorMessage,
  ): GovukFrontendRadiosItemWithConditional[] {
    const htmlString = this.buildIdentifyTextArea(content, formData, errorMessage)
    return [
      {
        id: 'YesRadio',
        value: content.yesText,
        text: content.yesText,
        checked: formData.didYouIdentify === true,
        conditional: { html: htmlString },
      },
      {
        id: 'NoRadio',
        value: content.noText,
        text: content.noText,
        checked: formData.didYouIdentify === false,
      },
    ]
  }

  private buildDidYouIdentifyRadio(
    content: DidYouIdentifyRadioContent,
    formData: IdentifiedAdditionalNeedsFormData,
    errorMessages?: Record<string, GovukFrontendErrorMessage>,
  ): GovukFrontendRadiosWithConditional {
    return {
      name: content.name,
      fieldset: {
        attributes: { 'data-testid': `fieldset-${content.name}` },
        legend: {
          text: content.title.replace('{{ firstname }}', this.referralFirstName),
          isPageHeading: false,
          classes: 'govuk-fieldset__legend govuk-fieldset__legend--m',
        },
      },
      errorMessage: errorMessages?.didYouIdentify,
      attributes: { 'data-testid': content.name },
      items: this.buildDidYouIdentifyRadioItems(content.items, formData, errorMessages?.identifyDetails),
    }
  }

  private buildExistingSupportNeedsDetails = (
    content: IdentifiedAdditionalNeedsContent,
    existingData: IcsFeedbackIdentifiedAdditionalSupportNeedsBffResponseDto["referralSupportNeeds"],
  ): GovukFrontendSummaryList | undefined => {
    if (!existingData || Object.keys(existingData).length === 0) return undefined

    const supportNeedsRows = this.getSupportNeedsRows(existingData, content)

    return {
      card: {
        title: {
          text: content.cardTitle,
        },
      },
      rows: supportNeedsRows,

      attributes: { 'data-testid': 'existing-support-needs-details' },
    }
  }

  private getSupportNeedsRows = (
    referralSupportNeeds: IcsFeedbackIdentifiedAdditionalSupportNeedsBffResponseDto["referralSupportNeeds"],
    content: IdentifiedAdditionalNeedsContent,
  ): GovukFrontendSummaryListRow[] => {
    const draftRows: GovukFrontendSummaryListRow[] = []

    Object.keys(referralSupportNeeds).forEach((key: string) => {
      if (referralSupportNeeds[key as keyof typeof referralSupportNeeds]) {
        draftRows.push({
          key: {
            text: content.supportNeedsTitle[key as keyof typeof content.supportNeedsTitle],
          },
          value: {
            html: referralSupportNeeds[key as keyof typeof referralSupportNeeds] as string,
          },
        })
      }
    })

    return draftRows
  }

  buildViewModel(res: Response): IdentifiedAdditionalNeedsViewModel {
    const content = this.buildStaticContent(res)
    const formData: IdentifiedAdditionalNeedsFormData = this.identifiedAdditionalNeeds
      ? {
          didYouIdentify: this.identifiedAdditionalNeeds.didYouIdentify,
          identifyDetails: this.identifiedAdditionalNeeds.identifyDetails,
        }
      : {}

    return {
      pageTitle: content.pageTitle,
      pageHeader: content.pageHeader,
      pageSubHeader: content.pageSubHeader.replace('{{ firstname }}', this.referralFirstName),
      firstname: this.referralFirstName,
      didYouIdentifyRadio: this.buildDidYouIdentifyRadio(
        content.didYouIdentifyRadio,
        formData,
        this.validationErrors?.messages,
      ),
      submitButton: { text: content.submitButtonText },
      submitHref: `/ics-feedback/${this.caseRefId}/identified-additional-needs`,
      backLink: { href: content.backLinkHref.replace('{{ id }}', this.caseRefId) },
      existingSupportNeedsDetails: this.buildExistingSupportNeedsDetails(content, this.existingSupportNeedsdata),
      formData,
    }
  }

  getTemplatePath(): string {
    return 'appointment/identifiedAdditionalNeeds'
  }
}
