import {
  ActionPlanSessionDeliveryDetailsResponse,
  QuestionChoice,
  SessionDeliveryQuestion,
} from '@community-support-api'
import { Response } from 'express'
import { GovukFrontendTextarea } from '@govuk-frontend'
import {
  GovukFrontendCheckboxesWithConditional,
  GovukFrontendRadiosItemWithConditional,
  GovukFrontendRadiosWithConditional,
} from '../../../@types/govukFrontend/derived'
import PresenterBase from '../../../presenter/presenterBase'
import {
  ActionPlanSessionDeliveryDetailsContent,
  ActionPlanSessionDeliveryDetailsViewModel,
} from './actionPlanSessionDeliveryDetailsViewModel'
import { ErrorMiddlewareErrors } from '../../../@types/express'

export default class ActionPlanSessionDeliveryDetailsPresenter extends PresenterBase<
  ActionPlanSessionDeliveryDetailsViewModel,
  ActionPlanSessionDeliveryDetailsContent
> {
  constructor(
    private readonly caseReference: string,
    private readonly sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse,
    private readonly validationErrors?: ErrorMiddlewareErrors,
    private readonly userInputData?: Record<string, string | string[]>,
  ) {
    super()
  }

  private stringUserInput(id: string, fallback?: string): string | undefined {
    const value = this.userInputData?.[id]
    if (value !== undefined) {
      return Array.isArray(value) ? value[0] : value
    }
    return fallback
  }

  private buildRadioQuestion(
    question: SessionDeliveryQuestion,
    conditionalHtmlByChoiceValue: Partial<Record<string, string>> = {},
  ): GovukFrontendRadiosWithConditional {
    return {
      idPrefix: question.key,
      name: question.key,
      fieldset: {
        legend: {
          text: question.label,
          classes: 'govuk-fieldset__legend--m',
        },
      },
      hint: question.hint ? { text: question.hint } : undefined,
      items: this.buildRadioItems(question, conditionalHtmlByChoiceValue),
      errorMessage: this.validationErrors?.messages[question.key] ?? null,
    }
  }

  private buildRadioItems(
    question: SessionDeliveryQuestion,
    conditionalHtmlByChoiceValue: Partial<Record<string, string>> = {},
  ): GovukFrontendRadiosItemWithConditional[] {
    return [...(question.choices ?? [])]
      .sort((left, right) => left.displayOrder - right.displayOrder)
      .map((choice): GovukFrontendRadiosItemWithConditional => {
        const conditionalHtml = conditionalHtmlByChoiceValue[choice.value]

        return {
          text: choice.label,
          value: choice.value,
          checked: this.isChoiceChecked(question, choice.value),
          conditional: conditionalHtml ? { html: conditionalHtml } : undefined,
        }
      })
  }

  private isChoiceChecked(question: SessionDeliveryQuestion, choiceValue: string): boolean {
    const userInput = this.userInputData?.[question.key]
    if (userInput !== undefined) {
      return Array.isArray(userInput) ? userInput.includes(choiceValue) : userInput === choiceValue
    }
    return question.savedResponses.some(savedResponse => savedResponse.value === choiceValue)
  }

  private buildCheckboxItems(question: SessionDeliveryQuestion): GovukFrontendCheckboxesWithConditional['items'] {
    return [...(question.choices ?? [])]
      .sort((left, right) => left.displayOrder - right.displayOrder)
      .map(choice => {
        return {
          text: choice.label,
          value: choice.value,
          checked: this.isChoiceChecked(question, choice.value),
        }
      })
  }

  private buildTextareaQuestion(question: SessionDeliveryQuestion): GovukFrontendTextarea {
    return {
      id: question.key,
      name: question.key,
      label: {
        text: question.label,
        classes: 'govuk-label--m',
      },
      hint: question.hint ? { text: question.hint } : undefined,
      value: this.stringUserInput(question.key, question.savedResponses[0]?.value) ?? '',
      rows: '1',
      errorMessage: this.validationErrors?.messages[question.key] ?? null,
    }
  }

  private buildAdditionalDetailsTextareaQuestion(
    question: SessionDeliveryQuestion,
    choice: QuestionChoice,
    id: string,
  ): GovukFrontendTextarea {
    const savedAdditionalDetails = question.savedResponses.find(
      savedResponse => savedResponse.value === choice.value,
    )?.additionalDetails

    return {
      id,
      name: id,
      label: {
        text: choice.additionalDetailsLabel,
      },
      rows: '1',
      errorMessage: this.validationErrors?.messages[id] ?? null,
      value: this.stringUserInput(id, savedAdditionalDetails ?? undefined) ?? '',
    }
  }

  private buildCheckboxQuestion(question: SessionDeliveryQuestion): GovukFrontendCheckboxesWithConditional {
    return {
      idPrefix: question.key,
      name: question.key,
      fieldset: {
        legend: {
          text: question.label,
          classes: 'govuk-fieldset__legend--m',
        },
      },
      hint: question.hint ? { text: question.hint } : undefined,
      items: this.buildCheckboxItems(question),
      errorMessage: this.validationErrors?.messages[question.key] ?? null,
    }
  }

  protected buildViewModel(res: Response): ActionPlanSessionDeliveryDetailsViewModel {
    const content = this.buildStaticContent(res)
    const frequencyQuestion = this.sessionDeliveryDetails.questions.find(q => q.key === 'SESSION_FREQUENCY')!
    const deliveryMethodQuestion = this.sessionDeliveryDetails.questions.find(q => q.key === 'SESSION_DELIVERY_METHOD')!
    const sessionFormatQuestion = this.sessionDeliveryDetails.questions.find(q => q.key === 'SESSION_FORMAT')!
    const videoCallChoice = deliveryMethodQuestion.choices.find(c => c.value === 'VIDEO_CALL')!
    const phoneCallChoice = deliveryMethodQuestion.choices.find(c => c.value === 'PHONE_CALL')!

    return {
      pageTitle: content.pageTitle,
      pageHeader: content.pageHeader,
      backLink: { href: content.backLink.replace('{{ id }}', this.caseReference) },
      submitButton: { text: content.continueButtonText },
      frequencyTextBoxArgs: this.buildTextareaQuestion(frequencyQuestion),
      howRadioArgs: (videoCallHtml, phoneCallHtml) =>
        this.buildRadioQuestion(deliveryMethodQuestion, {
          VIDEO_CALL: videoCallHtml,
          PHONE_CALL: phoneCallHtml,
        }),
      videoCallReasonTextBoxArgs: this.buildAdditionalDetailsTextareaQuestion(
        deliveryMethodQuestion,
        videoCallChoice,
        'VIDEO_CALL',
      ),
      phoneCallReasonTextBoxArgs: this.buildAdditionalDetailsTextareaQuestion(
        deliveryMethodQuestion,
        phoneCallChoice,
        'PHONE_CALL',
      ),
      formatCheckboxArgs: this.buildCheckboxQuestion(sessionFormatQuestion),
      submitHref: `/referral/${this.caseReference}/action-plan/session-delivery-details`,
    }
  }

  protected getTemplatePath(): string {
    return 'referral/actionPlanSessionDeliveryDetails'
  }
}
