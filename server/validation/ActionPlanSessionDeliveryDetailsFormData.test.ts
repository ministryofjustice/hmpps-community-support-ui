import { ActionPlanSessionDeliveryDetailsResponse } from '@community-support-api'
import { ActionPlanSessionDeliveryDetailsFormDataSchemaBuilder } from './ActionPlanSessionDeliveryDetailsFormData'

const sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse = {
  questions: [
    {
      id: '11111111-1111-1111-1111-111111111111',
      displayOrder: 1,
      label: 'How often will the sessions take place?',
      key: 'SESSION_FREQUENCY',
      answerType: 'TEXTAREA',
      maximumNumberOfResponses: 1,
      choices: [],
      savedResponses: [],
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      displayOrder: 2,
      label: 'How will the sessions take place?',
      key: 'SESSION_DELIVERY_METHOD',
      answerType: 'RADIO',
      maximumNumberOfResponses: 1,
      choices: [
        { value: 'IN_PERSON', label: 'In person', displayOrder: 1, displayAdditionalDetailsOnSelect: false },
        { value: 'VIDEO_CALL', label: 'Video call', displayOrder: 2, displayAdditionalDetailsOnSelect: true },
        { value: 'PHONE_CALL', label: 'Phone call', displayOrder: 3, displayAdditionalDetailsOnSelect: true },
      ],
      savedResponses: [],
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      displayOrder: 3,
      label: 'What format will you use for the sessions?',
      key: 'SESSION_FORMAT',
      answerType: 'CHECKBOX',
      maximumNumberOfResponses: 2,
      choices: [
        { value: 'One-to-one', label: 'One-to-one', displayOrder: 1, displayAdditionalDetailsOnSelect: false },
        { value: 'Group', label: 'Group', displayOrder: 2, displayAdditionalDetailsOnSelect: false },
      ],
      savedResponses: [],
    },
  ],
}

describe('ActionPlanSessionDeliveryDetailsFormDataSchemaBuilder', () => {
  const schema = ActionPlanSessionDeliveryDetailsFormDataSchemaBuilder(sessionDeliveryDetails)

  it('accepts valid data when the session is not video', () => {
    const result = schema.safeParse({
      SESSION_FREQUENCY: 'Every week',
      SESSION_DELIVERY_METHOD: 'IN_PERSON',
      SESSION_FORMAT: 'One-to-one',
    })

    expect(result.success).toBe(true)
  })

  it('requires whyVideoCall when how is VIDEO_CALL', () => {
    const result = schema.safeParse({
      SESSION_FREQUENCY: 'Every week',
      SESSION_DELIVERY_METHOD: 'VIDEO_CALL',
      SESSION_FORMAT: 'One-to-one',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ['VIDEO_CALL'],
          message: 'Enter why the sessions are not in person',
        }),
      ]),
    )
  })

  it('accepts whyVideoCall when how is VIDEO_CALL', () => {
    const result = schema.safeParse({
      SESSION_FREQUENCY: 'Every week',
      SESSION_DELIVERY_METHOD: 'VIDEO_CALL',
      SESSION_FORMAT: 'One-to-one',
      VIDEO_CALL: 'Because of remote-only sessions',
    })

    expect(result.success).toBe(true)
  })

  it('rejects a SESSION_DELIVERY_METHOD value that is not one of the fetched choices', () => {
    const result = schema.safeParse({
      SESSION_FREQUENCY: 'Every week',
      SESSION_DELIVERY_METHOD: 'HACKED_VALUE',
      SESSION_FORMAT: 'One-to-one',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ['SESSION_DELIVERY_METHOD'],
          message: 'Select how the sessions will take place',
        }),
      ]),
    )
  })

  it('rejects a SESSION_FORMAT value that is not one of the fetched choices', () => {
    const result = schema.safeParse({
      SESSION_FREQUENCY: 'Every week',
      SESSION_DELIVERY_METHOD: 'IN_PERSON',
      SESSION_FORMAT: ['One-to-one', 'HACKED_VALUE'],
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ['SESSION_FORMAT'],
          message: 'Select which format you will use for the sessions',
        }),
      ]),
    )
  })

  it('rejects empty SESSION_DELIVERY_METHOD and SESSION_FORMAT values', () => {
    const result = schema.safeParse({
      SESSION_FREQUENCY: 'Every week',
      SESSION_DELIVERY_METHOD: '',
      SESSION_FORMAT: [''],
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: ['SESSION_DELIVERY_METHOD'] }),
        expect.objectContaining({ path: ['SESSION_FORMAT'] }),
      ]),
    )
  })
})
