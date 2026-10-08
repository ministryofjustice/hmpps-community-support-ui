import {
  ActionPlanSessionDeliveryDetailsResponse,
  QuestionChoice,
  SessionDeliveryQuestion,
} from '@community-support-api'
import { Response } from 'express'
import { GovukFrontendTextarea } from '@govuk-frontend'
import {
  GovukFrontendRadiosItemWithConditional,
  GovukFrontendRadiosWithConditional,
} from '../../../@types/govukFrontend/derived'
import PresenterBase from '../../../presenter/presenterBase'
import { ErrorMiddlewareErrors } from '../../../@types/express'
import {
  ActionPlanRisksAndAdjustmentsContent,
  ActionPlanRisksAndAdjustmentsViewModel,
} from './actionPlanRisksAndAdjustmentsViewModel'
import SessionDeliveryDetailsQuestions from './sessionDeliveryDetailsQuestions'

export default class ActionPlanRisksAndAdjustmentsPresenter extends PresenterBase<
  ActionPlanRisksAndAdjustmentsViewModel,
  ActionPlanRisksAndAdjustmentsContent
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
      rows: '5',
      errorMessage: this.validationErrors?.messages[id] ?? null,
      value: this.stringUserInput(id, savedAdditionalDetails ?? undefined) ?? '',
    }
  }

  protected buildViewModel(res: Response): ActionPlanRisksAndAdjustmentsViewModel {
    const content = this.buildStaticContent(res)
    const plannedActivitiesRiskQuestion = this.sessionDeliveryDetails.questions.find(
      q => q.key === SessionDeliveryDetailsQuestions.RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES,
    )!
    const plannedActivitiesAdjustmentsQuestion = this.sessionDeliveryDetails.questions.find(
      q => q.key === SessionDeliveryDetailsQuestions.REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES,
    )!
    const riskInfo = plannedActivitiesRiskQuestion.choices.find(c => c.value === 'YES')!
    const adjustmentInfo = plannedActivitiesAdjustmentsQuestion.choices.find(c => c.value === 'YES')!

    return {
      pageTitle: content.pageTitle,
      pageHeader: content.pageHeader,
      backLink: { href: content.backLink.replace('{{ id }}', this.caseReference) },
      submitButton: { text: content.continueButtonText },
      plannedActivitiesRiskRadioArgs: (riskInfoHtml: string) =>
        this.buildRadioQuestion(plannedActivitiesRiskQuestion, { YES: riskInfoHtml }),
      plannedActivitiesAdjustmentsRadioArgs: (adjustmentInfoHtml: string) =>
        this.buildRadioQuestion(plannedActivitiesAdjustmentsQuestion, {
          YES: adjustmentInfoHtml,
        }),
      riskInfoTextBoxArgs: this.buildAdditionalDetailsTextareaQuestion(
        plannedActivitiesRiskQuestion,
        riskInfo,
        'RISK_INFO',
      ),
      adjustmentInfoTextBoxArgs: this.buildAdditionalDetailsTextareaQuestion(
        plannedActivitiesAdjustmentsQuestion,
        adjustmentInfo,
        'ADJUSTMENT_INFO',
      ),
    }
  }

  protected getTemplatePath(): string {
    return 'referral/actionPlanRisksAndAdjustments'
  }
}
