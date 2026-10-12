import { Factory } from 'fishery'
import { randomUUID } from 'crypto'
import type { ActionPlanSessionDeliveryDetailsResponse } from '@community-support-api'

type SavedAnswer = 'YES' | 'NO' | 'EMPTY'
type SavedResponses = ActionPlanSessionDeliveryDetailsResponse['questions'][number]['savedResponses']

const actionPlanCheckServiceEndDateFactory = Factory.define<
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
            label: 'No, I need to change the date',
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
  const { newServiceEndDate, serviceEndDateChangeReason } = transientParams

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
