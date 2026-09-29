import { ActionPlanSessionDeliveryDetailsFormDataSchemaBuilder } from './ActionPlanSessionDeliveryDetailsFormData'

describe('ActionPlanSessionDeliveryDetailsFormDataSchemaBuilder', () => {
  const schema = ActionPlanSessionDeliveryDetailsFormDataSchemaBuilder()

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
})
