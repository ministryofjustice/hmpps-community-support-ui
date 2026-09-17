export const sessionDeliveryQuestionFieldName = (questionId: string): string => `question-${questionId}`

export const sessionDeliveryAdditionalDetailsFieldName = (questionId: string, choiceDisplayOrder: number): string =>
  `question-${questionId}-choice-${choiceDisplayOrder}-additional-details`
