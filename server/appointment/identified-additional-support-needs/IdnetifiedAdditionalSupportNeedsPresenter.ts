import { Response } from 'express'
import {
  GovukFrontendErrorMessage
} from '@govuk-frontend'
import PresenterBase from '../../presenter/presenterBase'
import { IdentifiedAdditionalSupportNeedsContent,
  IdentifiedAdditionalSupportNeedsViewModel, 
  IdentifiedAdditionalSupportNeedsFormData, 
  DidYouIndentityRadioItemsContent,
  DidYouIndentityRadioContent} 
from './IdentifiedAddionalSupportNeedsViewModel'
import {
  GovukFrontendRadiosItemWithConditional,
  GovukFrontendRadiosWithConditional,
} from '../../@types/govukFrontend/derived'
import buildAppointmentDetails, { RecordSessionAttendancePresenterData } from '../record-ics/AppointmentDetailsModel'
import { components } from '../../@types/communitySupportApi/imported'
import { escapeHtml } from '../../utils/utils'
import { ErrorMiddlewareErrors } from '../../@types/express'
import buildAlreadyIdentifiedDetails, { IdentifiedAdditionalSupportNeedsPresenterData } from './IdntifiedDetailsModel'

export default class IdnetifiedAdditionalSupportNeedsPresenter extends PresenterBase<
  IdentifiedAdditionalSupportNeedsViewModel,
  IdentifiedAdditionalSupportNeedsContent
> {
  constructor(
    private readonly caseRefId: string,
    private readonly data: IdentifiedAdditionalSupportNeedsPresenterData,
    private readonly identityAdditionalSupportNeeds: components['schemas']['IdentityAdditionalSupportNeedsRequest'],
    private readonly validationErrors?: ErrorMiddlewareErrors,
  ) {
    super()
  }

  private buildIdentityTextArea(
    content: DidYouIndentityRadioItemsContent,
    formData: IdentifiedAdditionalSupportNeedsFormData,
    errorMessage?: GovukFrontendErrorMessage,
  ): string {
    const errorText: string = errorMessage ? errorMessage.text : undefined
    const errorHtml: string = errorText
      ? `
    <p id="${content.identityName}Error" class="govuk-error-message">
      <span class="govuk-visually-hidden">Error:</span> ${errorText}
    </p>`
      : ''
    return `
    <div class="govuk-form-group ${errorText ? 'govuk-form-group--error' : ''}" data-testid=${content.identityName} >
      <h1 class="govuk-label-wrapper govuk-label">
        <label class="govuk-label govuk-label--s"
          id=${content.identityName}Label>
          ${content.identityLabel.replace('{{ firstname }}', this.data.referralFirstName)}
        </label>
      </h1>
      ${errorHtml}
      <textarea class="govuk-textarea" id=${content.identityName}Input name=${content.identityName} rows="5" spellcheck="false" >${escapeHtml(formData.identityDetails) ?? ''}</textarea>
    </div>`
  }

  private buildDidYouIdentityRadioItems(
    content: DidYouIndentityRadioItemsContent,
    formData: IdentifiedAdditionalSupportNeedsFormData,
    errorMessage?: GovukFrontendErrorMessage,
  ): GovukFrontendRadiosItemWithConditional[] {
    const htmlString = this.buildIdentityTextArea(content, formData, errorMessage)
    return [
      {
        id: 'YesRadio',
        value: content.yesText,
        text: content.yesText,
        checked: formData.didYouIndentity === true,
        conditional: { html: htmlString },
      },
      {
        id: 'NoRadio',
        value: content.noText,
        text: content.noText,
        checked: formData.didYouIndentity === false,
      },
    ]
  }

  private buildDidYouIdnetityRadio(
    content: DidYouIndentityRadioContent,
    formData: IdentifiedAdditionalSupportNeedsFormData,
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
      //errorMessage: errorMessages.didYouIdentity,
      //errorMessage: errorMessages.lateReason,
      attributes: { 'data-testid': content.name },
      //items: this.buildDidYouIdentityRadioItems(content.items, formData, errorMessages.lateReason),
      items: this.buildDidYouIdentityRadioItems(content.items, formData, errorMessages),
    }
  }


    buildViewModel(res: Response): IdentifiedAdditionalSupportNeedsViewModel {
      console.log('buildViewModel calling')
      const content = this.buildStaticContent(res)
      const formData: IdentifiedAdditionalSupportNeedsFormData = this.identityAdditionalSupportNeeds
        ? {
            didYouIndentity: this.identityAdditionalSupportNeeds.didYouIdentity,
            identityDetails: this.identityAdditionalSupportNeeds.identityDetails
          }
        : {}

        console.log(this.data)
      return {
        pageTitle: content.pageTitle,
        pageHeader: content.pageHeader,
        pageSubHeader: content.pageSubHeader.replace('{{ firstname }}', this.data.referralFirstName),
        firstname: this.data.referralFirstName,
        didYouIndentityRadio: this.buildDidYouIdnetityRadio(
          content.didYouIndentityRadio,
          formData,
          this.validationErrors?.messages,
        ),
        submitButton: { text: content.submitButtonText },
        submitHref: `/ics-feedback/${this.caseRefId}/identified-additional-support-needs`,
        backLink: { href: content.backLinkHref.replace('{{ id }}', this.caseRefId) },
        alreadyIdentifiedDetails: buildAlreadyIdentifiedDetails({         
            identityName: 'identityName',identityDetails: 'identityDetails'}, this.data),
        formData
      }
    }
  
    getTemplatePath(): string {
      return 'appointment/identifiedAdditionalSupportNeeds'
    }

}

