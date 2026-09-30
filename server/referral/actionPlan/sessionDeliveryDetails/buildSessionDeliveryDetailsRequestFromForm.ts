import {
  ActionPlanSessionDeliveryDetailsRequest,
  ActionPlanSessionDeliveryDetailsResponse,
  SessionDeliveryDetailsQuestionAnswer,
  SessionDeliveryDetailsQuestionAnswers,
  SessionDeliveryQuestion,
} from '@community-support-api'

type FormValue = string | string[] | undefined

export type SessionDeliveryDetailsFormData = Record<string, FormValue>

// Form field names match `question.key` (e.g. SESSION_FREQUENCY), and additional-details
// fields are named after the selected choice's `value` (e.g. VIDEO_CALL, PHONE_CALL) -
// see actionPlanSessionDeliveryDetailsPresenter.ts / actionPlanSessionDeliveryDetails.njk.
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

const buildAdditionalDetails = (formData: SessionDeliveryDetailsFormData, choiceValue: string): string | undefined => {
  return normalizeSingleValue(formData[choiceValue])
}

const buildTextareaAnswers = (
  question: SessionDeliveryQuestion,
  formData: SessionDeliveryDetailsFormData,
): SessionDeliveryDetailsQuestionAnswer[] => {
  const value = normalizeSingleValue(formData[question.key])

  return value ? [{ value }] : []
}

const buildRadioAnswers = (
  question: SessionDeliveryQuestion,
  formData: SessionDeliveryDetailsFormData,
): SessionDeliveryDetailsQuestionAnswer[] => {
  const selectedValue = normalizeSingleValue(formData[question.key])
  const selectedChoice = question.choices?.find(choice => choice.value === selectedValue)

  if (!selectedValue) {
    return []
  }

  return [
    {
      value: selectedValue,
      additionalDetails:
        selectedChoice?.displayAdditionalDetailsOnSelect && selectedChoice
          ? buildAdditionalDetails(formData, selectedChoice.value)
          : undefined,
    },
  ]
}

const buildCheckboxAnswers = (
  question: SessionDeliveryQuestion,
  formData: SessionDeliveryDetailsFormData,
): SessionDeliveryDetailsQuestionAnswer[] => {
  const selectedValues = normalizeMultiValue(formData[question.key])

  return [...(question.choices ?? [])]
    .sort((left, right) => left.displayOrder - right.displayOrder)
    .filter(choice => selectedValues.includes(choice.value))
    .map(choice => ({
      value: choice.value,
      additionalDetails: choice.displayAdditionalDetailsOnSelect
        ? buildAdditionalDetails(formData, choice.value)
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
