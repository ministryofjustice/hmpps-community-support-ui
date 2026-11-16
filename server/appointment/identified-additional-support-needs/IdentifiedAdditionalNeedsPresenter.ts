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
import { govFrontendSummaryListRow } from '../../utils/viewUtils'

export default class IdentifiedAdditionalSupportNeedsPresenter extends PresenterBase<
  IdentifiedAdditionalNeedsViewModel,
  IdentifiedAdditionalNeedsContent
> {
  constructor(
    private readonly caseRefId: string,
    private readonly referralFirstName: string,
    private readonly existingSupportNeedsdata: IcsFeedbackIdentifiedAdditionalSupportNeedsBffResponseDto,
    private readonly identifiedAdditionalNeeds: IdentifiedAdditionalNeedsFormData,
    private readonly validationErrors?: ErrorMiddlewareErrors,
  ) {
    super()
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
      didYouIdentifyRadio: buildDidYouIdentifyRadio(
        content.didYouIdentifyRadio,
        formData,
        this.referralFirstName,
        this.validationErrors?.messages,
      ),
      submitButton: { text: content.submitButtonText },
      backLink: { href: content.backLinkHref.replace('{{ id }}', this.caseRefId) },
      existingSupportNeedsDetails: this.existingSupportNeedsdata
        ? buildExistingSuppportNeedsDetails(content, this.existingSupportNeedsdata.referralSupportNeeds)
        : undefined,
      formData,
    }
  }

  getTemplatePath(): string {
    return 'appointment/identifiedAdditionalNeeds'
  }
}

const getSupportNeedsRows = (
  referralSupportNeeds: Record<string, string>,
  supportNeedsTitle: Record<string, string>,
): GovukFrontendSummaryListRow[] => {
  return Object.entries(referralSupportNeeds)
    .map(([key, value]) => [supportNeedsTitle[key], value])
    .filter(([key]) => !!key)
    .filter(([_, value]) => !!value)
    .map(([key, value]) => govFrontendSummaryListRow(key, value))
}

const buildExistingSuppportNeedsDetails = (
  { cardTitle, supportNeedsTitle }: IdentifiedAdditionalNeedsContent,
  exisitngData: Record<string, string>,
): GovukFrontendSummaryList | undefined => {
  if (!exisitngData) return undefined

  const lookup: Record<string, string> = Object.fromEntries(
    Object.entries(supportNeedsTitle).map(([key, value]) => [`${key}Details`, value]),
  )
  const supportNeedsRows = getSupportNeedsRows(exisitngData, lookup)
  if (supportNeedsRows.length === 0) {
    return undefined
  }

  return {
    card: {
      title: {
        text: cardTitle,
      },
    },
    rows: supportNeedsRows,

    attributes: { 'data-testid': 'exisiting-support-needs-details' },
  }
}

const buildIdentifyTextArea = (
  content: DidYouIdentifyRadioItemsContent,
  formData: IdentifiedAdditionalNeedsFormData,
  referralFirstName: string,
  errorMessage?: GovukFrontendErrorMessage,
): string => {
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
          ${content.identifyDetailsLabel.replace('{{ firstname }}', referralFirstName)}
        </label>
      </h1>
      ${errorHtml}
      <textarea class="govuk-textarea" id=${content.identifyDetailsName}Input name=${content.identifyDetailsName} rows="5" spellcheck="false" >${escapeHtml(formData.identifyDetails) ?? ''}</textarea>
    </div>`
}

const buildDidYouIdentifyRadioItems = (
  content: DidYouIdentifyRadioItemsContent,
  formData: IdentifiedAdditionalNeedsFormData,
  referralFirstName: string,
  errorMessage?: GovukFrontendErrorMessage,
): GovukFrontendRadiosItemWithConditional[] => {
  const htmlString = buildIdentifyTextArea(content, formData, referralFirstName, errorMessage)
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

const buildDidYouIdentifyRadio = (
  content: DidYouIdentifyRadioContent,
  formData: IdentifiedAdditionalNeedsFormData,
  referralFirstName: string,
  errorMessages?: Record<string, GovukFrontendErrorMessage>,
): GovukFrontendRadiosWithConditional => {
  return {
    name: content.name,
    fieldset: {
      attributes: { 'data-testid': `fieldset-${content.name}` },
      legend: {
        text: content.title.replace('{{ firstname }}', referralFirstName),
        isPageHeading: false,
        classes: 'govuk-fieldset__legend govuk-fieldset__legend--m',
      },
    },
    errorMessage: errorMessages?.didYouIdentify,
    attributes: { 'data-testid': content.name },
    items: buildDidYouIdentifyRadioItems(content.items, formData, referralFirstName, errorMessages?.identifyDetails),
  }
}
