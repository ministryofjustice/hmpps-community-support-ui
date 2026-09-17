import {
  ActionPlanSessionDeliveryDetailsRequest,
  ActionPlanSessionDeliveryDetailsResponse,
} from '@community-support-api'
import applySessionDeliveryDetailsData from './applySessionDeliveryDetailsData'

describe('applySessionDeliveryDetailsDraft', () => {
  it('overrides backend saved responses with draft answers from the session', () => {
    const sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse = {
      questions: [
        {
          id: 'question-1',
          displayOrder: 1,
          label: 'Question 1',
          hint: null,
          answerType: 'TEXTAREA',
          maximumNumberOfResponses: 1,
          choices: null,
          savedResponses: [{ value: 'Backend answer', additionalDetails: null }],
        },
        {
          id: 'question-2',
          displayOrder: 2,
          label: 'Question 2',
          hint: null,
          answerType: 'RADIO',
          maximumNumberOfResponses: 1,
          choices: [],
          savedResponses: [{ value: 'Backend choice', additionalDetails: null }],
        },
      ],
    }

    const draft: ActionPlanSessionDeliveryDetailsRequest = {
      answers: [
        {
          questionId: 'question-1',
          incomingAnswerDetails: [{ value: 'Draft answer' }],
        },
        {
          questionId: 'question-2',
          incomingAnswerDetails: [],
        },
      ],
    }

    expect(applySessionDeliveryDetailsData(sessionDeliveryDetails, draft)).toEqual({
      questions: [
        {
          ...sessionDeliveryDetails.questions[0],
          savedResponses: [{ value: 'Draft answer', additionalDetails: null }],
        },
        {
          ...sessionDeliveryDetails.questions[1],
          savedResponses: [],
        },
      ],
    })
  })

  it('returns backend values unchanged when no draft exists', () => {
    const sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse = {
      questions: [],
    }

    expect(applySessionDeliveryDetailsData(sessionDeliveryDetails)).toBe(sessionDeliveryDetails)
  })
})
