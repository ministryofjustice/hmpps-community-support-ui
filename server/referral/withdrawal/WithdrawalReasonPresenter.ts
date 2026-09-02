import { Response } from 'express'
import { GovukFrontendBackLink, GovukFrontendButton, GovukFrontendErrorMessage } from '@govuk-frontend'
import { ErrorMiddlewareErrors } from '../../@types/express'
import {
  GovukFrontendRadiosItemWithConditional,
  GovukFrontendRadiosWithConditional,
} from '../../@types/govukFrontend/derived'
import PresenterBase from '../../presenter/presenterBase'
import { escapeHtml } from '../../utils/utils'
import { additionalInformationField, WithdrawalFormData, WithdrawalReason } from './WithdrawalFormData'

interface WithdrawalReasonContent {
  pageHeader: string
  hint: string
  additionalInformationLabel: string
  additionalInformationHint: string
  continueButtonText: string
  groups: Array<{ heading: string; reasons: Array<{ value: WithdrawalFormData['withdrawalReason']; text: string }> }>
}

interface WithdrawalReasonViewModel {
  pageHeader: string
  hint: string
  reasonGroups: Array<{ heading: string; radios: GovukFrontendRadiosWithConditional }>
  continueButton: GovukFrontendButton
  submitHref: string
  backLink: GovukFrontendBackLink
}

export default class WithdrawalReasonPresenter extends PresenterBase<
  WithdrawalReasonViewModel,
  WithdrawalReasonContent
> {
  constructor(
    private readonly referralIdentifier: string,
    private readonly referralName: string,
    private readonly formData?: WithdrawalFormData,
    private readonly validationErrors?: ErrorMiddlewareErrors,
  ) {
    super()
  }

  private buildReasonGroups(content: WithdrawalReasonContent): WithdrawalReasonViewModel['reasonGroups'] {
    return content.groups.map((group, groupIndex) => ({
      heading: group.heading,
        idPrefix: groupIndex === 0 ? 'withdrawalReason' : `withdrawalReason-${groupIndex}`,
          (reason): GovukFrontendRadiosItemWithConditional => ({
            value: reason.value,
            text: reason.text,
            checked: this.formData?.withdrawalReason === reason.value,
            conditional: {
              html: this.buildAdditionalInformationTextarea(
                content,
                reason.value,
                this.formData?.withdrawalReason === reason.value,
                this.validationErrors?.messages[additionalInformationField(reason.value)],
              ),
            },
          }),
        ),
      },
    }))
  }

  private buildAdditionalInformationTextarea(
    content: WithdrawalReasonContent,
    reason: WithdrawalReason,
    selected: boolean,
    errorMessage?: GovukFrontendErrorMessage,
  ): string {
    const errorText = selected ? errorMessage?.text : undefined
    const textareaId = additionalInformationField(reason)
    const hintId = `${textareaId}-hint`
    const errorId = `${textareaId}-error`
    const errorHtml = errorText
      ? `<p id="${errorId}" class="govuk-error-message"><span class="govuk-visually-hidden">Error:</span> ${errorText}</p>`
      : ''
    const value = selected ? (escapeHtml(this.formData?.additionalInformation) ?? '') : ''
    const ariaDescribedBy = `${hintId}${errorText ? ` ${errorId}` : ''}`
    return `<div class="govuk-form-group${errorText ? ' govuk-form-group--error' : ''}">
      <label class="govuk-label govuk-label--m" for="${textareaId}">${content.additionalInformationLabel}</label>
      <div id="${hintId}" class="govuk-hint">${content.additionalInformationHint}</div>
      ${errorHtml}
      <textarea class="govuk-textarea" id="${textareaId}" name="${textareaId}" rows="5" aria-describedby="${ariaDescribedBy}">${value}</textarea>
    </div>`
  }

  protected buildViewModel(res: Response): WithdrawalReasonViewModel {
    const content = this.buildStaticContent(res)
    return {
      pageHeader: content.pageHeader.replace('{{ name }}', this.referralName),
      hint: content.hint,
      reasonGroups: this.buildReasonGroups(content),
      continueButton: { text: content.continueButtonText },
      submitHref: `/referral/${this.referralIdentifier}/withdraw`,
      backLink: { href: `/referral-details/${this.referralIdentifier}` },
    }
  }

  protected getTemplatePath(): string {
    return 'referral/withdrawal/reason'
  }
}
