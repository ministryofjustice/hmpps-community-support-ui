import { randomUUID } from 'node:crypto'
import type { ActionPlanSessionDeliveryDetailsResponse } from '@community-support-api'

const sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse = {
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
      savedResponses: [{ value: 'Every week', additionalDetails: null }],
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
          additionalDetailsLabel: 'Reason for not being in person',
          additionalDetailsHint: 'Why are the sessions not in person?',
        },
        {
          value: 'VIDEO_CALL',
          label: 'Video call',
          displayOrder: 2,
          displayAdditionalDetailsOnSelect: true,
          additionalDetailsLabel: 'Reason for not being in person',
          additionalDetailsHint: 'Why are the sessions not in person?',
        },
        {
          value: 'PHONE_CALL',
          label: 'Phone call',
          displayOrder: 3,
          displayAdditionalDetailsOnSelect: true,
          additionalDetailsLabel: 'Reason for not being in person',
          additionalDetailsHint: 'Why are the sessions not in person?',
        },
      ],
      savedResponses: [{ value: 'VIDEO_CALL', additionalDetails: 'Travel restrictions' }],
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
      savedResponses: [{ value: 'GROUP_SESSION', additionalDetails: null }],
    },
  ],
}

export default sessionDeliveryDetails
