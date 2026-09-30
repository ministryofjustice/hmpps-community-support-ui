import {
  ActionPlanSessionDeliveryDetailsRequest,
  ActionPlanSessionDeliveryDetailsResponse,
  QuestionChoice,
  SessionDeliveryDetailsQuestionAnswer,
  SessionDeliveryDetailsQuestionAnswers,
  SessionDeliveryQuestion,
} from '@community-support-api'

type FormValue = string | string[] | undefined

export type SessionDeliveryDetailsFormData = Record<string, FormValue>

// Resolves the form field name that holds the additional-details value entered for a given
// choice. Defaults to the choice's own `value` (e.g. VIDEO_CALL, PHONE_CALL), which matches the
// naming used on the session-delivery-details page. There are some questions where this is not possible,
// on the risks-and-adjustments page, multiple questions share the choice value 'YES', so their
// additional-details fields must be named differently ('RISK_INFO', 'ADJUSTMENT_INFO'). When the value and name
// do not match, we need to supply a custom resolver.
export type AdditionalDetailsFieldNameResolver = (question: SessionDeliveryQuestion, choice: QuestionChoice) => string

const defaultAdditionalDetailsFieldNameResolver: AdditionalDetailsFieldNameResolver = (_question, choice) =>
  choice.value

// Builds a resolver that looks up an override field name by `question.key`, falling back to the
// default `choice.value` for any question not present in the map. Use this where a
// page's additional-details fields aren't named after their parent choice's value (e.g. when
// multiple questions on the same page share a choice value like 'YES').
export const buildAdditionalDetailsFieldNameResolver = (
  fieldNameByQuestionKey: Partial<Record<string, string>>,
): AdditionalDetailsFieldNameResolver => {
  return (question, choice) =>
    fieldNameByQuestionKey[question.key] ?? defaultAdditionalDetailsFieldNameResolver(question, choice)
}

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
  question: SessionDeliveryQuestion,
  choice: QuestionChoice,
  resolveAdditionalDetailsFieldName: AdditionalDetailsFieldNameResolver,
): string | undefined => {
  const fieldName = resolveAdditionalDetailsFieldName(question, choice)
  return normalizeSingleValue(formData[fieldName])
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
  resolveAdditionalDetailsFieldName: AdditionalDetailsFieldNameResolver,
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
          ? buildAdditionalDetails(formData, question, selectedChoice, resolveAdditionalDetailsFieldName)
          : undefined,
    },
  ]
}

const buildCheckboxAnswers = (
  question: SessionDeliveryQuestion,
  formData: SessionDeliveryDetailsFormData,
  resolveAdditionalDetailsFieldName: AdditionalDetailsFieldNameResolver,
): SessionDeliveryDetailsQuestionAnswer[] => {
  const selectedValues = normalizeMultiValue(formData[question.key])

  return [...(question.choices ?? [])]
    .sort((left, right) => left.displayOrder - right.displayOrder)
    .filter(choice => selectedValues.includes(choice.value))
    .map(choice => ({
      value: choice.value,
      additionalDetails: choice.displayAdditionalDetailsOnSelect
        ? buildAdditionalDetails(formData, question, choice, resolveAdditionalDetailsFieldName)
        : undefined,
    }))
}

const buildAnswersForQuestion = (
  question: SessionDeliveryQuestion,
  formData: SessionDeliveryDetailsFormData,
  resolveAdditionalDetailsFieldName: AdditionalDetailsFieldNameResolver,
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
      incomingAnswerDetails: buildRadioAnswers(question, formData, resolveAdditionalDetailsFieldName),
    }
  }

  return {
    questionId: question.id,
    incomingAnswerDetails: buildCheckboxAnswers(question, formData, resolveAdditionalDetailsFieldName),
  }
}

export default function buildSessionDeliveryDetailsRequestFromForm(
  sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse,
  formData: SessionDeliveryDetailsFormData,
  resolveAdditionalDetailsFieldName: AdditionalDetailsFieldNameResolver = defaultAdditionalDetailsFieldNameResolver,
): ActionPlanSessionDeliveryDetailsRequest {
  return {
    answers: [...sessionDeliveryDetails.questions]
      .sort((left, right) => left.displayOrder - right.displayOrder)
      .map(question => buildAnswersForQuestion(question, formData, resolveAdditionalDetailsFieldName)),
  }
}
