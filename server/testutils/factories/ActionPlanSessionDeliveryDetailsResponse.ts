import { Factory } from 'fishery'
import { randomUUID } from 'crypto'
import type { ActionPlanSessionDeliveryDetailsResponse } from '@community-support-api'

type SavedAnswer = 'YES' | 'NO' | 'EMPTY'

const actionPlanSessionDeliveryDetailsFactory = Factory.define<
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

export const serviceEndDateUnchangedResponse = actionPlanSessionDeliveryDetailsFactory.build(
  {},
  { transient: { savedAnswer: 'YES' } },
)

export const serviceEndDateChangedResponse = actionPlanSessionDeliveryDetailsFactory.build(
  {},
  { transient: { savedAnswer: 'NO' } },
)

export const serviceEndDateEmptyResponse = actionPlanSessionDeliveryDetailsFactory.build(
  {},
  { transient: { savedAnswer: 'EMPTY' } },
)
