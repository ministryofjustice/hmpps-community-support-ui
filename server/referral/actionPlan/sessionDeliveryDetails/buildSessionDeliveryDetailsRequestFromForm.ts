import {
  ActionPlanSessionDeliveryDetailsRequest,
  ActionPlanSessionDeliveryDetailsResponse,
  SessionDeliveryDetailsQuestionAnswer,
  SessionDeliveryDetailsQuestionAnswers,
  SessionDeliveryQuestion,
} from '@community-support-api'
import { sessionDeliveryAdditionalDetailsFieldName, sessionDeliveryQuestionFieldName } from './fieldNames'

type FormValue = string | string[] | undefined

export type SessionDeliveryDetailsFormData = Record<string, FormValue>

const normalizeSingleValue = (value: FormValue): string | undefined => {
  if (Array.isArray(value)) {
    return normalizeSingleValue(value[0])
  }

  const trimmedValue = value?.trim()
  return trimmedValue || undefined
}

const normalizeMultiValue = (value: FormValue): string[] => {
  if (!value) {
    return []
  }

  const values = Array.isArray(value) ? value : [value]
  return values.map(entry => entry.trim()).filter(Boolean)
}

const buildAdditionalDetails = (
  formData: SessionDeliveryDetailsFormData,
  questionId: string,
  choiceDisplayOrder: number,
): string | undefined => {
  return normalizeSingleValue(formData[sessionDeliveryAdditionalDetailsFieldName(questionId, choiceDisplayOrder)])
}

const buildTextareaAnswers = (
  question: SessionDeliveryQuestion,
  formData: SessionDeliveryDetailsFormData,
): SessionDeliveryDetailsQuestionAnswer[] => {
  const value = normalizeSingleValue(formData[sessionDeliveryQuestionFieldName(question.id)])

  return value ? [{ value }] : []
}

const buildRadioAnswers = (
  question: SessionDeliveryQuestion,
  formData: SessionDeliveryDetailsFormData,
): SessionDeliveryDetailsQuestionAnswer[] => {
  const selectedValue = normalizeSingleValue(formData[sessionDeliveryQuestionFieldName(question.id)])
  const selectedChoice = question.choices?.find(choice => choice.value === selectedValue)

  if (!selectedValue) {
    return []
  }

  return [
    {
      value: selectedValue,
      additionalDetails:
        selectedChoice?.displayAdditionalDetailsOnSelect && selectedChoice
          ? buildAdditionalDetails(formData, question.id, selectedChoice.displayOrder)
          : undefined,
    },
  ]
}

const buildCheckboxAnswers = (
  question: SessionDeliveryQuestion,
  formData: SessionDeliveryDetailsFormData,
): SessionDeliveryDetailsQuestionAnswer[] => {
  const selectedValues = normalizeMultiValue(formData[sessionDeliveryQuestionFieldName(question.id)])

  return [...(question.choices ?? [])]
    .sort((left, right) => left.displayOrder - right.displayOrder)
    .filter(choice => selectedValues.includes(choice.value))
    .map(choice => ({
      value: choice.value,
      additionalDetails: choice.displayAdditionalDetailsOnSelect
        ? buildAdditionalDetails(formData, question.id, choice.displayOrder)
        : undefined,
    }))
}

const buildAnswersForQuestion = (
  question: SessionDeliveryQuestion,
  formData: SessionDeliveryDetailsFormData,
): SessionDeliveryDetailsQuestionAnswers => {
  if (question.answerType === 'TEXTAREA') {
    return {
      questionId: question.id,
      incomingAnswerDetails: buildTextareaAnswers(question, formData),
    }
  }

  if (question.answerType === 'RADIO') {
    return {
      questionId: question.id,
      incomingAnswerDetails: buildRadioAnswers(question, formData),
    }
  }

  return {
    questionId: question.id,
    incomingAnswerDetails: buildCheckboxAnswers(question, formData),
  }
}

export default function buildSessionDeliveryDetailsRequestFromForm(
  sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse,
  formData: SessionDeliveryDetailsFormData,
): ActionPlanSessionDeliveryDetailsRequest {
  return {
    answers: [...sessionDeliveryDetails.questions]
      .sort((left, right) => left.displayOrder - right.displayOrder)
      .map(question => buildAnswersForQuestion(question, formData)),
  }
}
