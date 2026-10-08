import { ActionPlanSessionDeliveryDetailsResponse, SessionDeliveryQuestion } from '@community-support-api'
import { Response } from 'express'
import { GovukFrontendInsetText, GovukFrontendRadios, GovukFrontendRadiosItem } from '@govuk-frontend'
import PresenterBase from '../../../presenter/presenterBase'
import { ErrorMiddlewareErrors } from '../../../@types/express'
import { getServiceEndDateValue } from '../../../validation/ActionPlanServiceEndDateCheckFormData'
import { ServiceEndDateCheckContent, ServiceEndDateCheckViewModel } from './serviceEndDateCheckViewModel'
import SessionDeliveryDetailsQuestions from './sessionDeliveryDetailsQuestions'

export default class ActionPlanServiceEndDateCheckPresenter extends PresenterBase<
  ServiceEndDateCheckViewModel,
  ServiceEndDateCheckContent
> {
  constructor(
    private readonly caseReference: string,
    private readonly sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse,
    private readonly validationErrors?: ErrorMiddlewareErrors,
    private readonly userInputData?: Record<string, string | string[]>,
  ) {
    super()
  }

  private buildRadioQuestion(question: SessionDeliveryQuestion): GovukFrontendRadios {
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
      items: this.buildRadioItems(question),
      errorMessage: this.validationErrors?.messages[question.key] ?? null,
    }
  }

  private buildRadioItems(question: SessionDeliveryQuestion): GovukFrontendRadiosItem[] {
    return [...(question.choices ?? [])]
      .sort((left, right) => left.displayOrder - right.displayOrder)
      .map((choice): GovukFrontendRadiosItem => {
        return {
          text: choice.label,
          value: choice.value,
          checked: this.isChoiceChecked(question, choice.value),
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

  private generateInsetText(): GovukFrontendInsetText {
    const serviceEndDate = getServiceEndDateValue(this.sessionDeliveryDetails)

    return {
      text: `This referral states the service should be completed by ${serviceEndDate}`,
    }
  }

  protected buildViewModel(res: Response): ServiceEndDateCheckViewModel {
    const content = this.buildStaticContent(res)
    const serviceEndDateCheckQuestion = this.sessionDeliveryDetails.questions.find(
      q => q.key === SessionDeliveryDetailsQuestions.SERVICE_END_DATE_CHECK,
    )!

    return {
      pageTitle: content.pageTitle,
      pageHeader: content.pageHeader,
      backLink: { href: content.backLink.replace('{{ id }}', this.caseReference) },
      submitButton: { text: content.continueButtonText },
      serviceEndDateCheckRadioArgs: this.buildRadioQuestion(serviceEndDateCheckQuestion),
      insetTextArgs: this.generateInsetText(),
    }
  }

  protected getTemplatePath(): string {
    return 'referral/actionPlanServiceEndDateCheck'
  }
}
