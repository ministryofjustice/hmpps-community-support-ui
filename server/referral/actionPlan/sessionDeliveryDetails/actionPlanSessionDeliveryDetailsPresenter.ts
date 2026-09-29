import {
  ActionPlanSessionDeliveryDetailsResponse,
  QuestionChoice,
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

  private stringUserInput(id: string): string | undefined {
    const value = this.userInputData?.[id]
    return Array.isArray(value) ? value[0] : value
  }

  private buildRadioQuestion(
    question: SessionDeliveryQuestion,
    id: string,
    conditionalHtmlByChoiceValue: Partial<Record<string, string>> = {},
  ): GovukFrontendRadiosWithConditional {
    return {
      idPrefix: id,
      name: id,
      fieldset: {
        legend: {
          text: question.label,
          classes: 'govuk-fieldset__legend--m',
        },
      },
      hint: question.hint ? { text: question.hint } : undefined,
      items: this.buildRadioItems(question, id, conditionalHtmlByChoiceValue),
      errorMessage: this.validationErrors?.messages[id] ?? null,
    }
  }

  private buildRadioItems(
    question: SessionDeliveryQuestion,
    parentId: string,
    conditionalHtmlByChoiceValue: Partial<Record<string, string>> = {},
  ): GovukFrontendRadiosItemWithConditional[] {
    return [...(question.choices ?? [])]
      .sort((left, right) => left.displayOrder - right.displayOrder)
      .map((choice): GovukFrontendRadiosItemWithConditional => {
        const conditionalHtml =
          conditionalHtmlByChoiceValue[choice.value]

        return {
          text: choice.label,
          value: choice.value,
          checked: this.stringUserInput(parentId) === choice.value,
          conditional: conditionalHtml ? { html: conditionalHtml } : undefined,
        }
      })
  }

  private isChoiceChecked(question: SessionDeliveryQuestion, parentId: string, choiceValue: string): boolean {
    const userInput = this.userInputData?.[parentId]
    if (userInput !== undefined) {
      return Array.isArray(userInput) ? userInput.includes(choiceValue) : userInput === choiceValue
    }
    return question.savedResponses.some(savedResponse => savedResponse.value === choiceValue)
  }

  private buildCheckboxItems(question: SessionDeliveryQuestion, parentId: string): GovukFrontendCheckboxesWithConditional['items'] {
    return [...(question.choices ?? [])]
      .sort((left, right) => left.displayOrder - right.displayOrder)
      .map(choice => {

        return {
          text: choice.label,
          value: choice.value,
          checked: this.isChoiceChecked(question, parentId, choice.value),
        }
      })
  }

  private buildTextareaQuestion(question: SessionDeliveryQuestion, id: string): GovukFrontendTextarea {
    return {
      id: id,
      name: id,
      label: {
        text: question.label,
        classes: 'govuk-label--m',
      },
      hint: question.hint ? { text: question.hint } : undefined,
      value: this.stringUserInput(id) ?? '',
      rows: '1',
      errorMessage: this.validationErrors?.messages[id] ?? null,
    }
  }

  private buildAdditionalDetailsTextareaQuestion(choice: QuestionChoice, id: string): GovukFrontendTextarea {
    return {
      id: id,
      name: id,
      label: {
        text: choice.additionalDetailsLabel,
        classes: 'govuk-label--m',
      },
      rows: '1',
      errorMessage: this.validationErrors?.messages[id] ?? null,
      value: this.stringUserInput(id) ?? '',
    }
  }

  private buildCheckboxQuestion(question: SessionDeliveryQuestion, id: string): GovukFrontendCheckboxesWithConditional {
    return {
      idPrefix: id,
      name: id,
      fieldset: {
        legend: {
          text: question.label,
          classes: 'govuk-fieldset__legend--m',
        },
      },
      hint: question.hint ? { text: question.hint } : undefined,
      items: this.buildCheckboxItems(question, id),
      errorMessage: this.validationErrors?.messages[id] ?? null,
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
      pageHeader: content.pageHeader,
      backLink: { href: `/referral/${this.caseReference}/action-plan/add-activities` },
      submitButton: { text: content.continueButtonText },
      frequencyTextBoxArgs: this.buildTextareaQuestion(
        frequencyQuestion,
        'frequency',
      ),
      howRadioArgs: (videoCallHtml, phoneCallHtml) =>
        this.buildRadioQuestion(
          deliveryMethodQuestion,
          'how',
          {
            VIDEO_CALL: videoCallHtml,
            PHONE_CALL: phoneCallHtml,
          },
        ),
      videoCallReasonTextBoxArgs: this.buildAdditionalDetailsTextareaQuestion(
        videoCallChoice,
        'whyVideoCall',
      ),
      phoneCallReasonTextBoxArgs: this.buildAdditionalDetailsTextareaQuestion(
        phoneCallChoice,
        'whyPhoneCall',
      ),
      formatCheckboxArgs: this.buildCheckboxQuestion(
        sessionFormatQuestion,
        'format',
      ),
      submitHref: `/referral/${this.caseReference}/action-plan/session-delivery-details`,
    }
  }

  protected getTemplatePath(): string {
    return 'referral/actionPlanSessionDeliveryDetails'
  }
}
