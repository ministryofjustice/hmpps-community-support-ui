import { ActionPlanSessionDeliveryDetailsResponse } from '@community-support-api'
import buildSessionDeliveryDetailsRequestFromForm from './buildSessionDeliveryDetailsRequestFromForm'

describe('buildSessionDeliveryDetailsRequestFromForm', () => {
  it('maps textarea, radio and checkbox answers into the API request shape', () => {
    const sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse = {
      questions: [
        {
          id: 'question-1',
          displayOrder: 1,
          label: 'How often will sessions take place?',
          key: 'SESSION_FREQUENCY',
          hint: 'For example, every week.',
          answerType: 'TEXTAREA',
          maximumNumberOfResponses: 1,
          choices: null,
          savedResponses: [],
        },
        {
          id: 'question-2',
          displayOrder: 2,
          label: 'How will the sessions take place?',
          key: 'SESSION_DELIVERY_METHOD',
          hint: 'Select one option.',
          answerType: 'RADIO',
          maximumNumberOfResponses: 1,
          choices: [
            {
              value: 'IN_PERSON',
              label: 'In person',
              displayOrder: 1,
              displayAdditionalDetailsOnSelect: true,
              additionalDetailsLabel: 'Reason',
              additionalDetailsHint: 'Why are the sessions not in person?',
            },
            {
              value: 'PHONE_CALL',
              label: 'Phone call',
              displayOrder: 2,
              displayAdditionalDetailsOnSelect: true,
              additionalDetailsLabel: 'Reason',
              additionalDetailsHint: 'Why are the sessions not in person?',
            },
          ],
          savedResponses: [],
        },
        {
          id: 'question-3',
          displayOrder: 3,
          label: 'What format will you use for the sessions?',
          key: 'SESSION_FORMAT',
          hint: 'Select all that apply.',
          answerType: 'CHECKBOX',
          maximumNumberOfResponses: 2,
          choices: [
            {
              value: 'ONE_TO_ONE_SESSION',
              label: 'One-to-one session',
              displayOrder: 1,
              displayAdditionalDetailsOnSelect: false,
              additionalDetailsLabel: null,
              additionalDetailsHint: null,
            },
            {
              value: 'GROUP_SESSION',
              label: 'Group session',
              displayOrder: 2,
              displayAdditionalDetailsOnSelect: true,
              additionalDetailsLabel: 'How many people will be in the group?',
              additionalDetailsHint: 'Include the expected group size.',
            },
          ],
          savedResponses: [],
        },
      ],
    }

    const request = buildSessionDeliveryDetailsRequestFromForm(sessionDeliveryDetails, {
      SESSION_FREQUENCY: 'Every 2 weeks',
      SESSION_DELIVERY_METHOD: 'PHONE_CALL',
      PHONE_CALL: 'No suitable room available',
      SESSION_FORMAT: ['ONE_TO_ONE_SESSION', 'GROUP_SESSION'],
      GROUP_SESSION: '6 people',
    })

    expect(request).toEqual({
      answers: [
        {
          questionId: 'question-1',
          incomingAnswerDetails: [{ value: 'Every 2 weeks' }],
        },
        {
          questionId: 'question-2',
          incomingAnswerDetails: [{ value: 'PHONE_CALL', additionalDetails: 'No suitable room available' }],
        },
        {
          questionId: 'question-3',
          incomingAnswerDetails: [
            { value: 'ONE_TO_ONE_SESSION', additionalDetails: undefined },
            { value: 'GROUP_SESSION', additionalDetails: '6 people' },
          ],
        },
      ],
    })
  })

  it('includes empty answer arrays when a previously answered question is cleared', () => {
    const sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse = {
      questions: [
        {
          id: 'question-1',
          displayOrder: 1,
          label: 'Question 1',
          key: 'SESSION_FREQUENCY',
          hint: null,
          answerType: 'TEXTAREA',
          maximumNumberOfResponses: 1,
          choices: null,
          savedResponses: [{ value: 'Old answer', additionalDetails: null }],
        },
        {
          id: 'question-2',
          displayOrder: 2,
          label: 'Question 2',
          key: 'SESSION_DELIVERY_METHOD',
          hint: null,
          answerType: 'RADIO',
          maximumNumberOfResponses: 1,
          choices: [
            {
              value: 'FIRST',
              label: 'First',
              displayOrder: 1,
              displayAdditionalDetailsOnSelect: false,
              additionalDetailsLabel: null,
              additionalDetailsHint: null,
            },
          ],
          savedResponses: [{ value: 'FIRST', additionalDetails: null }],
        },
      ],
    }

    const request = buildSessionDeliveryDetailsRequestFromForm(sessionDeliveryDetails, {})

    expect(request).toEqual({
      answers: [
        { questionId: 'question-1', incomingAnswerDetails: [] },
        { questionId: 'question-2', incomingAnswerDetails: [] },
      ],
    })
  })
})
