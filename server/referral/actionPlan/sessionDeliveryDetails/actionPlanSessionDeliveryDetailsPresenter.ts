import {
  ActionPlanSessionDeliveryDetailsResponse,
  QuestionChoice,
  SavedResponse,
  SessionDeliveryQuestion,
} from '@community-support-api'
import { Response } from 'express'
import { GovukFrontendHint, GovukFrontendTextarea } from '@govuk-frontend'
import {
  GovukFrontendCheckboxesWithConditional,
  GovukFrontendRadiosItemWithConditional,
  GovukFrontendRadiosWithConditional,
} from '../../../@types/govukFrontend/derived'
import PresenterBase from '../../../presenter/presenterBase'
import { escapeHtml } from '../../../utils/utils'
import {
  ActionPlanSessionDeliveryDetailsContent,
  ActionPlanSessionDeliveryDetailsQuestionViewModel,
  ActionPlanSessionDeliveryDetailsViewModel,
} from './actionPlanSessionDeliveryDetailsViewModel'
import { sessionDeliveryAdditionalDetailsFieldName, sessionDeliveryQuestionFieldName } from './fieldNames'

export default class ActionPlanSessionDeliveryDetailsPresenter extends PresenterBase<
  ActionPlanSessionDeliveryDetailsViewModel,
  ActionPlanSessionDeliveryDetailsContent
> {
  constructor(
    private readonly caseReference: string,
    private readonly sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse,
  ) {
    super()
  }

  private buildQuestionHint(text?: string | null): GovukFrontendHint | undefined {
    return text ? { text } : undefined
  }

  private buildConditionalAdditionalDetails(
    questionId: string,
    choice: QuestionChoice,
    value?: string | null,
  ): string | undefined {
    if (!choice.displayAdditionalDetailsOnSelect) {
      return undefined
    }

    const fieldName = sessionDeliveryAdditionalDetailsFieldName(questionId, choice.displayOrder)
    const label = escapeHtml(choice.additionalDetailsLabel ?? 'Additional details') ?? 'Additional details'
    const hint = escapeHtml(choice.additionalDetailsHint ?? undefined)
    const escapedValue = escapeHtml(value ?? undefined) ?? ''
    const hintHtml = hint ? `<div id="${fieldName}-hint" class="govuk-hint">${hint}</div>` : ''
    const describedBy = hint ? ` aria-describedby="${fieldName}-hint"` : ''

    return `<div class="govuk-form-group">
      <label class="govuk-label govuk-label--s" for="${fieldName}">${label}</label>
      ${hintHtml}
      <textarea class="govuk-textarea" id="${fieldName}" name="${fieldName}" rows="5"${describedBy}>${escapedValue}</textarea>
    </div>`
  }

  private savedResponseForChoice(question: SessionDeliveryQuestion, choiceValue: string): SavedResponse | undefined {
    return question.savedResponses.find(savedResponse => savedResponse.value === choiceValue)
  }

  private buildRadioItems(question: SessionDeliveryQuestion): GovukFrontendRadiosItemWithConditional[] {
    return [...(question.choices ?? [])]
      .sort((left, right) => left.displayOrder - right.displayOrder)
      .map((choice): GovukFrontendRadiosItemWithConditional => {
        const conditionalHtml = this.buildConditionalAdditionalDetails(
          question.id,
          choice,
          this.savedResponseForChoice(question, choice.value)?.additionalDetails,
        )

        return {
          text: choice.label,
          value: choice.value,
          checked: question.savedResponses[0]?.value === choice.value,
          conditional: conditionalHtml ? { html: conditionalHtml } : undefined,
        }
      })
  }

  private buildCheckboxItems(question: SessionDeliveryQuestion): GovukFrontendCheckboxesWithConditional['items'] {
    return [...(question.choices ?? [])]
      .sort((left, right) => left.displayOrder - right.displayOrder)
      .map(choice => {
        const savedResponse = this.savedResponseForChoice(question, choice.value)
        const conditionalHtml = this.buildConditionalAdditionalDetails(
          question.id,
          choice,
          savedResponse?.additionalDetails,
        )

        return {
          text: choice.label,
          value: choice.value,
          checked: Boolean(savedResponse),
          conditional: conditionalHtml ? { html: conditionalHtml } : undefined,
        }
      })
  }

  private buildTextareaQuestion(question: SessionDeliveryQuestion): GovukFrontendTextarea {
    return {
      id: sessionDeliveryQuestionFieldName(question.id),
      name: sessionDeliveryQuestionFieldName(question.id),
      label: {
        text: question.label,
        classes: 'govuk-label--m',
      },
      hint: this.buildQuestionHint(question.hint),
      value: question.savedResponses[0]?.value ?? '',
      rows: '5',
    }
  }

  private buildRadioQuestion(question: SessionDeliveryQuestion): GovukFrontendRadiosWithConditional {
    return {
      idPrefix: sessionDeliveryQuestionFieldName(question.id),
      name: sessionDeliveryQuestionFieldName(question.id),
      fieldset: {
        legend: {
          text: question.label,
          classes: 'govuk-fieldset__legend--m',
        },
      },
      hint: this.buildQuestionHint(question.hint),
      items: this.buildRadioItems(question),
    }
  }

  private buildCheckboxQuestion(question: SessionDeliveryQuestion): GovukFrontendCheckboxesWithConditional {
    return {
      idPrefix: sessionDeliveryQuestionFieldName(question.id),
      name: sessionDeliveryQuestionFieldName(question.id),
      fieldset: {
        legend: {
          text: question.label,
          classes: 'govuk-fieldset__legend--m',
        },
      },
      hint: this.buildQuestionHint(question.hint),
      items: this.buildCheckboxItems(question),
    }
  }

  private buildQuestionViewModel(question: SessionDeliveryQuestion): ActionPlanSessionDeliveryDetailsQuestionViewModel {
    if (question.answerType === 'TEXTAREA') {
      return { id: question.id, textarea: this.buildTextareaQuestion(question) }
    }

    if (question.answerType === 'RADIO') {
      return { id: question.id, radios: this.buildRadioQuestion(question) }
    }

    return { id: question.id, checkboxes: this.buildCheckboxQuestion(question) }
  }

  protected buildViewModel(res: Response): ActionPlanSessionDeliveryDetailsViewModel {
    const content = this.buildStaticContent(res)

    return {
      pageHeader: content.pageHeader,
      backLink: { href: `/referral/${this.caseReference}/action-plan/add-activities` },
      questions: [...this.sessionDeliveryDetails.questions]
        .sort((left, right) => left.displayOrder - right.displayOrder)
        .map(question => this.buildQuestionViewModel(question)),
      submitButton: { text: content.continueButtonText },
      submitHref: `/referral/${this.caseReference}/action-plan/session-delivery-details`,
    }
  }

  protected getTemplatePath(): string {
    return 'referral/actionPlanSessionDeliveryDetails'
  }
}
