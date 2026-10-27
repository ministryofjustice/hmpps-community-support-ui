import { Response } from 'express'
import { GovukFrontendErrorMessage, GovukFrontendSummaryList, GovukFrontendSummaryListRow } from '@govuk-frontend'
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

// export type ExistingSupportNeedsPresenterData = Pick<
//   ExistingSupportNeedsBffResponseDto,
//   'supportNeeds' | 'referralFirstName'
// >
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
          ${content.identityDetailsLabel.replace('{{ firstname }}', this.existingSupportNeedsdata.referralFirstName)}
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
          text: content.title.replace('{{ firstname }}', this.existingSupportNeedsdata.referralFirstName),
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
    content: IdentifiedAdditionalNeedsContent
  ): GovukFrontendSummaryListRow[] => {
    const draftRows: GovukFrontendSummaryListRow[] = []

    if (exisitngData.physicalHealthDetails) {
      draftRows.push({
        key: {
          text: content.supportNeedsTitle.physicalHealth
        },
        value: {
          html: exisitngData.physicalHealthDetails
        }
      })
    }
    if (exisitngData.mentalEmotionalHealthDetails) {
      draftRows.push({
        key: {
          text: content.supportNeedsTitle.mentalEmotionalHealth
        },
        value: {
          html: exisitngData.mentalEmotionalHealthDetails
        }
      })
    }
    if (exisitngData.neurodiversityDetails) {
      draftRows.push({
        key: {
          text: content.supportNeedsTitle.neurodiversity
        },
        value: {
          html: exisitngData.neurodiversityDetails
        }
      })
    }
    if (exisitngData.locationTravelDetails) {
      draftRows.push({
        key: {
          text: content.supportNeedsTitle.locationTravel
        },
        value: {
          html: exisitngData.locationTravelDetails
        }
      })
    }
    if (exisitngData.caringResponsibilitiesDetails) {
      draftRows.push({
        key: {
          text: content.supportNeedsTitle.caringResponsibilities
        },
        value: {
          html: exisitngData.caringResponsibilitiesDetails
        }
      })
    }
    if (exisitngData.employmentResponsibilitiesDetails) {
      draftRows.push({
        key: {
          text: content.supportNeedsTitle.employmentResponsibilities
        },
        value: {
          html: exisitngData.employmentResponsibilitiesDetails
        }
      })
    }
    if (exisitngData.diversityDetails) {
      draftRows.push({
        key: {
          text: content.supportNeedsTitle.diversity
        },
        value: {
          html: exisitngData.diversityDetails
        }
      })
    }
    if (exisitngData.anythingElseDetails) {
      draftRows.push({
        key: {
          text: content.supportNeedsTitle.anythingElse
        },
        value: {
          html: exisitngData.anythingElseDetails
        }
      })
    }
    return draftRows
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
      pageSubHeader: content.pageSubHeader.replace('{{ firstname }}', this.existingSupportNeedsdata.referralFirstName),
      firstname: this.existingSupportNeedsdata.referralFirstName,
      didYouIdentityRadio: this.buildDidYouIdentityRadio(
        content.didYouIdentityRadio,
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
