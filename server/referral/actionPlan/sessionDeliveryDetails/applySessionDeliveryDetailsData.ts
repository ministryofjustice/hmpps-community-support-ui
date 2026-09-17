import {
  ActionPlanSessionDeliveryDetailsRequest,
  ActionPlanSessionDeliveryDetailsResponse,
  SavedResponse,
} from '@community-support-api'

const buildSavedResponses = (
  draftAnswer: ActionPlanSessionDeliveryDetailsRequest['answers'][number] | undefined,
): SavedResponse[] | undefined => {
  if (!draftAnswer) {
    return undefined
  }

  return draftAnswer.incomingAnswerDetails.map(answer => ({
    value: answer.value,
    additionalDetails: answer.additionalDetails ?? null,
  }))
}

export default function applySessionDeliveryDetailsData(
  sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse,
  sessionDelivery?: ActionPlanSessionDeliveryDetailsRequest,
): ActionPlanSessionDeliveryDetailsResponse {
  if (!sessionDelivery) {
    return sessionDeliveryDetails
  }

  return {
    questions: sessionDeliveryDetails.questions.map(question => {
      const draftAnswer = sessionDelivery.answers.find(answer => answer.questionId === question.id)
      const savedResponses = buildSavedResponses(draftAnswer)

      if (!savedResponses) {
        return question
      }

      return {
        ...question,
        savedResponses,
      }
    }),
  }
}
