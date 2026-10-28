import { Response } from 'express'
import { GovukFrontendErrorMessage, GovukFrontendSummaryList, GovukFrontendSummaryListRow } from '@govuk-frontend'
import { ExistingSupportNeedsBffResponseDto } from '@community-support-api'
import PresenterBase from '../../presenter/presenterBase'
import {
  IdentifiedAdditionalNeedsContent,
  IdentifiedAdditionalNeedsViewModel,
  IdentifiedAdditionalNeedsFormData,
  DidYouIdentifyRadioItemsContent,
  DidYouIdentifyRadioContent,
} from './IdentifiedAddionalNeedsViewModel'
import {
  GovukFrontendRadiosItemWithConditional,
  GovukFrontendRadiosWithConditional,
} from '../../@types/govukFrontend/derived'
import { components } from '../../@types/communitySupportApi/imported'
import { escapeHtml } from '../../utils/utils'
import { ErrorMiddlewareErrors } from '../../@types/express'

export default class IdentifiedAdditionalSupportNeedsPresenter extends PresenterBase<
  IdentifiedAdditionalNeedsViewModel,
  IdentifiedAdditionalNeedsContent
> {
  constructor(
    private readonly caseRefId: string,
    private readonly existingSupportNeedsdata: ExistingSupportNeedsBffResponseDto,
    private readonly identifiedAdditionalNeeds: components['schemas']['IdentifiedAdditionalNeedsRequest'],
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
          ${content.identifyDetailsLabel.replace('{{ firstname }}', this.existingSupportNeedsdata.referralFirstName)}
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
          text: content.title.replace('{{ firstname }}', this.existingSupportNeedsdata.referralFirstName),
          isPageHeading: false,
          classes: 'govuk-fieldset__legend govuk-fieldset__legend--m',
        },
      },
      errorMessage: errorMessages.didYouIdentify,
      attributes: { 'data-testid': content.name },
      items: this.buildDidYouIdentifyRadioItems(content.items, formData, errorMessages.identifyDetails),
    }
  }

  private buildExistingSuppportNeedsDetails = (
    content: IdentifiedAdditionalNeedsContent,
    exisitngData: ExistingSupportNeedsBffResponseDto,
  ): GovukFrontendSummaryList | undefined => {
    if (!exisitngData.referralFirstName) return undefined

    const draftRows = this.getDraftRows(exisitngData, content)

    return {
      card: {
        title: {
          text: content.cardTitle,
        },
      },
      rows: draftRows,

      attributes: { 'data-testid': 'exisiting-support-needs-details' },
    }
  }

  private getDraftRows = (
    exisitngData: ExistingSupportNeedsBffResponseDto,
    content: IdentifiedAdditionalNeedsContent,
  ): GovukFrontendSummaryListRow[] => {
    const draftRows: GovukFrontendSummaryListRow[] = []

    if (exisitngData.physicalHealthDetails) {
      draftRows.push({
        key: {
          text: content.supportNeedsTitle.physicalHealth,
        },
        value: {
          html: exisitngData.physicalHealthDetails,
        },
      })
    }
    if (exisitngData.mentalEmotionalHealthDetails) {
      draftRows.push({
        key: {
          text: content.supportNeedsTitle.mentalEmotionalHealth,
        },
        value: {
          html: exisitngData.mentalEmotionalHealthDetails,
        },
      })
    }
    if (exisitngData.neurodiversityDetails) {
      draftRows.push({
        key: {
          text: content.supportNeedsTitle.neurodiversity,
        },
        value: {
          html: exisitngData.neurodiversityDetails,
        },
      })
    }
    if (exisitngData.locationTravelDetails) {
      draftRows.push({
        key: {
          text: content.supportNeedsTitle.locationTravel,
        },
        value: {
          html: exisitngData.locationTravelDetails,
        },
      })
    }
    if (exisitngData.caringResponsibilitiesDetails) {
      draftRows.push({
        key: {
          text: content.supportNeedsTitle.caringResponsibilities,
        },
        value: {
          html: exisitngData.caringResponsibilitiesDetails,
        },
      })
    }
    if (exisitngData.employmentResponsibilitiesDetails) {
      draftRows.push({
        key: {
          text: content.supportNeedsTitle.employmentResponsibilities,
        },
        value: {
          html: exisitngData.employmentResponsibilitiesDetails,
        },
      })
    }
    if (exisitngData.diversityDetails) {
      draftRows.push({
        key: {
          text: content.supportNeedsTitle.diversity,
        },
        value: {
          html: exisitngData.diversityDetails,
        },
      })
    }
    if (exisitngData.anythingElseDetails) {
      draftRows.push({
        key: {
          text: content.supportNeedsTitle.anythingElse,
        },
        value: {
          html: exisitngData.anythingElseDetails,
        },
      })
    }
    return draftRows
  }

  buildViewModel(res: Response): IdentifiedAdditionalNeedsViewModel {
    const content = this.buildStaticContent(res)
    const formData: IdentifiedAdditionalNeedsFormData = this.identifiedAdditionalNeeds
      ? {
          didYouIdentify: this.identifiedAdditionalNeeds.identified,
          identifyDetails: this.identifiedAdditionalNeeds.details,
        }
      : {}

    return {
      pageTitle: content.pageTitle,
      pageHeader: content.pageHeader,
      pageSubHeader: content.pageSubHeader.replace('{{ firstname }}', this.existingSupportNeedsdata.referralFirstName),
      firstname: this.existingSupportNeedsdata.referralFirstName,
      didYouIdentifyRadio: this.buildDidYouIdentifyRadio(
        content.didYouIdentifyRadio,
        formData,
        this.validationErrors?.messages,
      ),
      submitButton: { text: content.submitButtonText },
      submitHref: `/ics-feedback/${this.caseRefId}/identified-additional-needs`,
      backLink: { href: content.backLinkHref.replace('{{ id }}', this.caseRefId) },
      existingSupportNeedsDetails: this.buildExistingSuppportNeedsDetails(content, this.existingSupportNeedsdata),
      formData,
    }
  }

  getTemplatePath(): string {
    return 'appointment/identifiedAdditionalNeeds'
  }
}
