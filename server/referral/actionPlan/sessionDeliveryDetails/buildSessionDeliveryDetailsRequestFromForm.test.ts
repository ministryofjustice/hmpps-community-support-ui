import {
  ActionPlanSessionDeliveryDetailsResponse,
  QuestionChoice,
  SessionDeliveryQuestion,
} from '@community-support-api'
import buildSessionDeliveryDetailsRequestFromForm, {
  buildAdditionalDetailsFieldNameResolver,
} from './buildSessionDeliveryDetailsRequestFromForm'

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

  it('uses a custom resolver to look up additional-details fields that are not named after the choice value', () => {
    const sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse = {
      questions: [
        {
          id: 'risk-question',
          displayOrder: 1,
          label: 'Is there a risk associated with the planned activities?',
          key: 'RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES',
          hint: null,
          answerType: 'RADIO',
          maximumNumberOfResponses: 1,
          choices: [
            {
              value: 'YES',
              label: 'Yes',
              displayOrder: 1,
              displayAdditionalDetailsOnSelect: true,
              additionalDetailsLabel: 'Give details',
              additionalDetailsHint: null,
            },
            {
              value: 'NO',
              label: 'No',
              displayOrder: 2,
              displayAdditionalDetailsOnSelect: false,
              additionalDetailsLabel: null,
              additionalDetailsHint: null,
            },
          ],
          savedResponses: [],
        },
        {
          id: 'adjustments-question',
          displayOrder: 2,
          label: 'Will you put reasonable adjustments in place?',
          key: 'REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES',
          hint: null,
          answerType: 'RADIO',
          maximumNumberOfResponses: 1,
          choices: [
            {
              value: 'YES',
              label: 'Yes',
              displayOrder: 1,
              displayAdditionalDetailsOnSelect: true,
              additionalDetailsLabel: 'Give details',
              additionalDetailsHint: null,
            },
            {
              value: 'NO',
              label: 'No',
              displayOrder: 2,
              displayAdditionalDetailsOnSelect: false,
              additionalDetailsLabel: null,
              additionalDetailsHint: null,
            },
          ],
          savedResponses: [],
        },
      ],
    }

    const request = buildSessionDeliveryDetailsRequestFromForm(
      sessionDeliveryDetails,
      {
        RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES: 'YES',
        RISK_INFO: 'There is a risk of harm to staff',
        REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES: 'YES',
        ADJUSTMENT_INFO: 'Provide a hearing loop',
      },
      buildAdditionalDetailsFieldNameResolver({
        RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES: 'RISK_INFO',
        REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES: 'ADJUSTMENT_INFO',
      }),
    )

    expect(request).toEqual({
      answers: [
        {
          questionId: 'risk-question',
          incomingAnswerDetails: [{ value: 'YES', additionalDetails: 'There is a risk of harm to staff' }],
        },
        {
          questionId: 'adjustments-question',
          incomingAnswerDetails: [{ value: 'YES', additionalDetails: 'Provide a hearing loop' }],
        },
      ],
    })
  })
})

describe('buildAdditionalDetailsFieldNameResolver', () => {
  const question = (key: string): SessionDeliveryQuestion => ({
    id: 'question-id',
    displayOrder: 1,
    label: 'Label',
    key,
    hint: null,
    answerType: 'RADIO',
    maximumNumberOfResponses: 1,
    choices: [],
    savedResponses: [],
  })

  const choice = (value: string): QuestionChoice => ({
    value,
    label: value,
    displayOrder: 1,
    displayAdditionalDetailsOnSelect: true,
    additionalDetailsLabel: null,
    additionalDetailsHint: null,
  })

  it('returns the override field name when the question key has one', () => {
    const resolver = buildAdditionalDetailsFieldNameResolver({
      RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES: 'RISK_INFO',
    })

    expect(resolver(question('RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES'), choice('YES'))).toBe('RISK_INFO')
  })

  it('falls back to the choice value when the question key has no override', () => {
    const resolver = buildAdditionalDetailsFieldNameResolver({
      RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES: 'RISK_INFO',
    })

    expect(resolver(question('SESSION_DELIVERY_METHOD'), choice('VIDEO_CALL'))).toBe('VIDEO_CALL')
  })
})
