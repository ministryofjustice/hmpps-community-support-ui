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

const OTHER_REASON_TEXT = 'another reason'

interface WithdrawalReasonContent {
  pageHeader: string
  additionalInformationLabel: string
  continueButtonText: string
}

interface WithdrawalReasonViewModel {
  pageHeader: string
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
    private readonly withdrawalReasonGroups: Record<string, string[]>,
    private readonly formData?: WithdrawalFormData,
    private readonly validationErrors?: ErrorMiddlewareErrors,
  ) {
    super()
  }

  private orderReasonNames(reasonNames: string[]): string[] {
    const otherReasonIndex = reasonNames.findIndex(name => name.trim().toLowerCase() === OTHER_REASON_TEXT)
    if (otherReasonIndex === -1) {
      return reasonNames
    }
    const orderedNames = [...reasonNames]
    const [otherReason] = orderedNames.splice(otherReasonIndex, 1)
    orderedNames.push(otherReason)
    return orderedNames
  }

  private buildReasonGroups(content: WithdrawalReasonContent): WithdrawalReasonViewModel['reasonGroups'] {
    const groupEntries = Object.entries(this.withdrawalReasonGroups)
    return groupEntries.map(([heading, reasonNames], groupIndex) => {
      const orderedNames = this.orderReasonNames(reasonNames)
      const hasOtherReason = orderedNames.at(-1)?.trim().toLowerCase() === OTHER_REASON_TEXT
      const items: GovukFrontendRadiosItemWithConditional[] = orderedNames.map(reasonName => ({
        value: reasonName,
        text: reasonName,
        checked: this.formData?.withdrawalReason === reasonName,
        conditional: {
          html: this.buildAdditionalInformationTextarea(
            content,
            reasonName,
            this.formData?.withdrawalReason === reasonName,
            this.validationErrors?.messages[additionalInformationField(reasonName)],
          ),
        },
      }))
      if (hasOtherReason && items.length > 1) {
        items.splice(items.length - 1, 0, { divider: 'or', value: '' })
      }
      return {
        heading,
        radios: {
          name: 'withdrawalReason',
          idPrefix: groupIndex === 0 ? 'withdrawalReason' : `withdrawalReason-group${groupIndex}`,
          items,
        },
      }
    })
  }

  private buildAdditionalInformationTextarea(
    content: WithdrawalReasonContent,
    reason: WithdrawalReason,
    selected: boolean,
    errorMessage?: GovukFrontendErrorMessage,
  ): string {
    const errorText = selected ? errorMessage?.text : undefined
    const textareaId = additionalInformationField(reason)
    const errorId = `${textareaId}-error`
    const errorHtml = errorText
      ? `<p id="${errorId}" class="govuk-error-message"><span class="govuk-visually-hidden">Error:</span> ${errorText}</p>`
      : ''
    const value = selected ? (escapeHtml(this.formData?.additionalInformation) ?? '') : ''
    const ariaDescribedBy = errorText ? ` aria-describedby="${errorId}"` : ''
    return `<div class="govuk-form-group${errorText ? ' govuk-form-group--error' : ''}">
      <label class="govuk-label govuk-hint" for="${textareaId}">${content.additionalInformationLabel}</label>
      ${errorHtml}
      <textarea class="govuk-textarea" id="${textareaId}" name="${textareaId}" rows="5"${ariaDescribedBy}>${value}</textarea>
    </div>`
  }

  protected buildViewModel(res: Response): WithdrawalReasonViewModel {
    const content = this.buildStaticContent(res)
    return {
      pageHeader: content.pageHeader.replace('{{ name }}', this.referralName),
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
