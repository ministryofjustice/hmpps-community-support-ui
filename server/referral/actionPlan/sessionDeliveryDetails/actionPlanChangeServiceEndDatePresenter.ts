import { ActionPlanSessionDeliveryDetailsResponse, SessionDeliveryQuestion } from '@community-support-api'
import { Response } from 'express'
import { GovukFrontendDateInput, GovukFrontendTextarea } from '@govuk-frontend'
import PresenterBase from '../../../presenter/presenterBase'
import {
  ActionPlanChangeServiceEndDateContent,
  ActionPlanChangeServiceEndDateViewModel,
} from './actionPlanChangeServiceEndDateViewModel'
import { ErrorMiddlewareErrors } from '../../../@types/express'
import SessionDeliveryDetailsQuestions from './sessionDeliveryDetailsQuestions'

const parseDateParts = (value?: string | null): { day?: string; month?: string; year?: string } => {
  if (!value) {
    return {}
  }

  const dateValue = value.includes('T') ? value.split('T')[0] : value
  const match = /^\d{4}-\d{2}-\d{2}$/.exec(dateValue)
  if (!match) {
    return {}
  }

  const [year, month, day] = dateValue.split('-')
  return { day, month, year }
}

export default class ActionPlanChangeServiceEndDatePresenter extends PresenterBase<
  ActionPlanChangeServiceEndDateViewModel,
  ActionPlanChangeServiceEndDateContent
> {
  constructor(
    private readonly caseReference: string,
    private readonly sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse,
    private readonly validationErrors?: ErrorMiddlewareErrors,
    private readonly userInputData?: Record<string, string | string[]>,
    private readonly isCheckAnswersEdit = false,
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

  private dateValueForQuestion(question: SessionDeliveryQuestion, part: 'day' | 'month' | 'year'): string {
    const userInput = this.stringUserInput(`${question.key}-${part}`)
    if (userInput !== undefined) {
      return userInput
    }

    const savedValue = parseDateParts(question.savedResponses[0]?.value)
    return savedValue[part] ?? ''
  }

  private buildDateQuestion(question: SessionDeliveryQuestion): GovukFrontendDateInput {
    return {
      id: question.key,
      namePrefix: question.key,
      fieldset: {
        legend: {
          text: question.label,
          classes: 'govuk-fieldset__legend--m',
        },
      },
      hint: question.hint ? { text: question.hint } : undefined,
      errorMessage: this.validationErrors?.messages[question.key] ?? null,
      items: [
        {
          name: 'day',
          classes: 'govuk-input--width-2',
          value: this.dateValueForQuestion(question, 'day'),
        },
        {
          name: 'month',
          classes: 'govuk-input--width-2',
          value: this.dateValueForQuestion(question, 'month'),
        },
        {
          name: 'year',
          classes: 'govuk-input--width-4',
          value: this.dateValueForQuestion(question, 'year'),
        },
      ],
    }
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
      rows: '5',
      errorMessage: this.validationErrors?.messages[question.key] ?? null,
    }
  }

  protected buildViewModel(res: Response): ActionPlanChangeServiceEndDateViewModel {
    const content = this.buildStaticContent(res)
    const updateServiceEndDateQuestion = this.sessionDeliveryDetails.questions.find(
      q => q.key === SessionDeliveryDetailsQuestions.UPDATE_SERVICE_END_DATE,
    )!
    const changeServiceEndDateReasonQuestion = this.sessionDeliveryDetails.questions.find(
      q => q.key === SessionDeliveryDetailsQuestions.SERVICE_END_DATE_CHANGE_REASON,
    )!

    return {
      pageTitle: content.pageTitle,
      pageHeader: content.pageHeader,
      backLink: {
        href: this.isCheckAnswersEdit
          ? content.editBackLink.replace('{{ id }}', this.caseReference)
          : content.backLink.replace('{{ id }}', this.caseReference),
      },
      submitButton: { text: this.isCheckAnswersEdit ? content.saveAndContinueButtonText : content.continueButtonText },
      updateServiceEndDateDateInputArgs: this.buildDateQuestion(updateServiceEndDateQuestion),
      changeServiceEndDateReasonTextBoxArgs: this.buildTextareaQuestion(changeServiceEndDateReasonQuestion),
      submitHref: `/referral/${this.caseReference}/action-plan/session-delivery-details`,
    }
  }

  protected getTemplatePath(): string {
    return 'referral/actionPlanChangeServiceEndDate'
  }
}
