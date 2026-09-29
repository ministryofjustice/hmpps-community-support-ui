import { ActionPlanSessionDeliveryDetailsFormDataSchemaBuilder } from './ActionPlanSessionDeliveryDetailsFormData'

describe('ActionPlanSessionDeliveryDetailsFormDataSchemaBuilder', () => {
  const schema = ActionPlanSessionDeliveryDetailsFormDataSchemaBuilder()

  it('accepts valid data when the session is not video', () => {
    const result = schema.safeParse({
      frequency: 'Every week',
      how: 'PHONE',
      format: 'One-to-one',
    })

    expect(result.success).toBe(true)
  })

  it('requires whyVideoCall when how is VIDEO_CALL', () => {
    const result = schema.safeParse({
      frequency: 'Every week',
      how: 'VIDEO_CALL',
      format: 'One-to-one',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ['whyVideoCall'],
          message: 'Enter why the sessions are not in person',
        }),
      ]),
    )
  })

  it('accepts whyVideoCall when how is VIDEO_CALL', () => {
    const result = schema.safeParse({
      frequency: 'Every week',
      how: 'VIDEO_CALL',
      format: 'One-to-one',
      whyVideoCall: 'Because of remote-only sessions',
    })

    expect(result.success).toBe(true)
  })
})
