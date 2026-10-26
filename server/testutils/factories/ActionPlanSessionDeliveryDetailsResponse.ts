import { Factory } from 'fishery'
import { addDays, format } from 'date-fns'
import { randomUUID } from 'crypto'
import type { ActionPlanSessionDeliveryDetailsResponse } from '@community-support-api'

type SavedAnswer = 'YES' | 'NO' | 'EMPTY'
type SavedResponses = ActionPlanSessionDeliveryDetailsResponse['questions'][number]['savedResponses']

export const actionPlanSessionDeliveryDetailsFactory = Factory.define<
  ActionPlanSessionDeliveryDetailsResponse,
  {
    sessionFrequency?: SavedResponses
    sessionDeliveryMethod?: SavedResponses
    sessionFormat?: SavedResponses
  }
>(({ transientParams }) => ({
  questions: [
    {
      id: randomUUID(),
      displayOrder: 1,
      label: 'How often will sessions take place?',
      key: 'SESSION_FREQUENCY',
      hint: 'For example, every week, every 2 weeks, every month.',
      answerType: 'TEXTAREA',
      maximumNumberOfResponses: 1,
      choices: null,
      savedResponses: transientParams.sessionFrequency ?? [{ value: 'Every week', additionalDetails: null }],
    },
    {
      id: randomUUID(),
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
          additionalDetailsLabel: 'Why are the sessions not in person?',
        },
        {
          value: 'VIDEO_CALL',
          label: 'Video call',
          displayOrder: 2,
          displayAdditionalDetailsOnSelect: true,
          additionalDetailsLabel: 'Why are the sessions not in person?',
        },
        {
          value: 'PHONE_CALL',
          label: 'Phone call',
          displayOrder: 3,
          displayAdditionalDetailsOnSelect: true,
          additionalDetailsLabel: 'Why are the sessions not in person?',
        },
      ],
      savedResponses: transientParams.sessionDeliveryMethod ?? [
        { value: 'VIDEO_CALL', additionalDetails: 'Travel restrictions' },
      ],
    },
    {
      id: randomUUID(),
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
          displayAdditionalDetailsOnSelect: false,
          additionalDetailsLabel: null,
          additionalDetailsHint: null,
        },
      ],
      savedResponses: transientParams.sessionFormat ?? [{ value: 'GROUP_SESSION', additionalDetails: null }],
    },
  ],
}))

export const actionPlanRisksAndAdjustmentsFactory = Factory.define<
  ActionPlanSessionDeliveryDetailsResponse,
  {
    firstName?: string
    risks?: SavedResponses
    reasonableAdjustments?: SavedResponses
  }
>(({ transientParams }) => {
  const { firstName = 'Alex' } = transientParams

  return {
    questions: [
      {
        id: randomUUID(),
        displayOrder: 1,
        label: 'Are there any risks associated with the planned activities?',
        key: 'RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES',
        answerType: 'RADIO',
        maximumNumberOfResponses: 1,
        choices: [
          {
            value: 'YES',
            label: 'Yes',
            displayOrder: 1,
            displayAdditionalDetailsOnSelect: true,
            additionalDetailsLabel: 'Give details about the risks and what you will put in place to reduce them',
            additionalDetailsHint: 'Details about the risks and what you will put in place to reduce them',
          },
          {
            value: 'NO',
            label: 'No',
            displayOrder: 2,
            displayAdditionalDetailsOnSelect: false,
          },
        ],
        savedResponses: transientParams.risks ?? [{ value: 'YES', additionalDetails: 'Risk of harm to staff' }],
      },
      {
        id: randomUUID(),
        displayOrder: 2,
        label: `Will you put any reasonable adjustments in place to help ${firstName} take part in the planned activities?`,
        key: 'REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES',
        answerType: 'RADIO',
        maximumNumberOfResponses: 1,
        choices: [
          {
            value: 'YES',
            label: 'Yes',
            displayOrder: 1,
            displayAdditionalDetailsOnSelect: true,
            additionalDetailsLabel: `Give details about what reasonable adjustments you will make and how this will support ${firstName}`,
            additionalDetailsHint: `Details about what reasonable adjustments you will make and how this will support ${firstName}`,
          },
          {
            value: 'NO',
            label: 'No',
            displayOrder: 2,
            displayAdditionalDetailsOnSelect: false,
          },
        ],
        savedResponses: transientParams.reasonableAdjustments ?? [
          { value: 'YES', additionalDetails: 'Step-free access' },
        ],
      },
    ],
  }
})

export const actionPlanPersonInvolvementFactory = Factory.define<
  ActionPlanSessionDeliveryDetailsResponse,
  { firstName?: string; savedResponses?: SavedResponses }
>(({ transientParams }) => {
  const { firstName = 'Alex' } = transientParams

  return {
    questions: [
      {
        id: randomUUID(),
        displayOrder: 1,
        label: `Was ${firstName} involved in creating the action plan?`,
        key: 'USER_INVOLVEMENT_IN_ACTION_PLAN',
        hint: 'Select one option.',
        answerType: 'RADIO',
        maximumNumberOfResponses: 1,
        choices: [
          {
            value: 'YES',
            label: 'Yes',
            displayOrder: 1,
            displayAdditionalDetailsOnSelect: false,
            additionalDetailsLabel: null,
            additionalDetailsHint: null,
          },
          {
            value: 'NO',
            label: 'No',
            displayOrder: 2,
            displayAdditionalDetailsOnSelect: true,
            additionalDetailsLabel: `Why was ${firstName} not involved?`,
            additionalDetailsHint: null,
          },
        ],
        savedResponses: transientParams.savedResponses ?? [{ value: 'NO', additionalDetails: 'User was sick' }],
      },
    ],
  }
})

export const actionPlanCheckServiceEndDateFactory = Factory.define<
  ActionPlanSessionDeliveryDetailsResponse,
  { savedAnswer: SavedAnswer }
>(({ transientParams }) => {
  const savedAnswer = transientParams.savedAnswer ?? 'YES'

  return {
    questions: [
      {
        id: randomUUID(),
        displayOrder: 1,
        label: 'Is the service end date still 24 May 2026?',
        key: 'SERVICE_END_DATE_CHECK',
        answerType: 'RADIO',
        maximumNumberOfResponses: 1,
        choices: [
          {
            value: 'YES',
            label: 'Yes',
            displayOrder: 1,
            displayAdditionalDetailsOnSelect: false,
            additionalDetailsLabel: null,
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
        savedResponses: savedAnswer === 'EMPTY' ? [] : [{ value: savedAnswer, additionalDetails: null }],
      },
    ],
  }
})

const buildSavedResponses = (value: string | null): SavedResponses =>
  value === null ? [] : [{ value, additionalDetails: null }]

export const actionPlanUpdateServiceEndDateFactory = Factory.define<
  ActionPlanSessionDeliveryDetailsResponse,
  {
    newServiceEndDate?: string | null
    serviceEndDateChangeReason?: string | null
  }
>(({ transientParams }) => {
  const { newServiceEndDate = format(addDays(new Date(), 10), 'yyyy-MM-dd'), serviceEndDateChangeReason } =
    transientParams

  return {
    questions: [
      {
        id: randomUUID(),
        displayOrder: 1,
        label: 'What is the new service end date?',
        key: 'NEW_SERVICE_END_DATE',
        answerType: 'DATE',
        maximumNumberOfResponses: 1,
        choices: null,
        savedResponses: buildSavedResponses(newServiceEndDate ?? null),
      },
      {
        id: randomUUID(),
        displayOrder: 2,
        label: 'Why are you changing the service end date?',
        key: 'SERVICE_END_DATE_CHANGE_REASON',
        answerType: 'TEXTAREA',
        maximumNumberOfResponses: 1,
        choices: null,
        savedResponses: buildSavedResponses(serviceEndDateChangeReason ?? null),
      },
    ],
  }
})

export const serviceEndDateUnchangedResponse = actionPlanCheckServiceEndDateFactory.build(
  {},
  { transient: { savedAnswer: 'YES' } },
)

export const serviceEndDateChangedResponse = actionPlanCheckServiceEndDateFactory.build(
  {},
  { transient: { savedAnswer: 'NO' } },
)

export const serviceEndDateEmptyResponse = actionPlanCheckServiceEndDateFactory.build(
  {},
  { transient: { savedAnswer: 'EMPTY' } },
)

export const updateServiceEndDateResponse = actionPlanUpdateServiceEndDateFactory.build(
  {},
  {
    transient: {
      newServiceEndDate: '2026-06-24',
      serviceEndDateChangeReason: 'Some reasons',
    },
  },
)

export const updateServiceEndDateEmptyResponse = actionPlanUpdateServiceEndDateFactory.build(
  {},
  {
    transient: {
      newServiceEndDate: null,
      serviceEndDateChangeReason: null,
    },
  },
)
