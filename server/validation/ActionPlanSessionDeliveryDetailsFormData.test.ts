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

  it('requires session frequency with the acceptance-criteria error message', () => {
    const result = schema.safeParse({
      SESSION_DELIVERY_METHOD: 'IN_PERSON',
      SESSION_FORMAT: 'One-to-one',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ['SESSION_FREQUENCY'],
          message: 'Enter how often sessions will take place',
        }),
      ]),
    )
  })

  it('accepts session frequency at 65000 characters and rejects longer values', () => {
    const validResult = schema.safeParse({
      SESSION_FREQUENCY: 'x'.repeat(65000),
      SESSION_DELIVERY_METHOD: 'IN_PERSON',
      SESSION_FORMAT: 'One-to-one',
    })
    const invalidResult = schema.safeParse({
      SESSION_FREQUENCY: 'x'.repeat(65001),
      SESSION_DELIVERY_METHOD: 'IN_PERSON',
      SESSION_FORMAT: 'One-to-one',
    })

    expect(validResult.success).toBe(true)
    expect(invalidResult.success).toBe(false)
    expect(invalidResult.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ['SESSION_FREQUENCY'],
          message: 'Details about session frequency must be 65000 characters or less',
        }),
      ]),
    )
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

  it('requires a reason when the delivery method is PHONE_CALL', () => {
    const result = schema.safeParse({
      SESSION_FREQUENCY: 'Every week',
      SESSION_DELIVERY_METHOD: 'PHONE_CALL',
      SESSION_FORMAT: 'One-to-one',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ['PHONE_CALL'],
          message: 'Enter why the sessions are not in person',
        }),
      ]),
    )
  })

  it('accepts a reason when the delivery method is PHONE_CALL', () => {
    const result = schema.safeParse({
      SESSION_FREQUENCY: 'Every week',
      SESSION_DELIVERY_METHOD: 'PHONE_CALL',
      SESSION_FORMAT: 'One-to-one',
      PHONE_CALL: 'Travel restrictions',
    })

    expect(result.success).toBe(true)
  })

  it('accepts both session formats together', () => {
    const result = schema.safeParse({
      SESSION_FREQUENCY: 'Every week',
      SESSION_DELIVERY_METHOD: 'IN_PERSON',
      SESSION_FORMAT: ['One-to-one', 'Group'],
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
          message: 'Select what format you will use for the sessions',
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
