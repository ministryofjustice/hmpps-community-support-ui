import { createWithdrawalFormDataSchema, createWithdrawalReasonSchema } from './WithdrawalFormData'

describe('withdrawal form validation', () => {
  const withdrawalReasons = ['Ineligible referral', 'Not engaged', 'Another reason']
  const WithdrawalReasonSchema = createWithdrawalReasonSchema(withdrawalReasons)
  const WithdrawalFormDataSchema = createWithdrawalFormDataSchema(withdrawalReasons)

  it.each(withdrawalReasons)('accepts %s as a withdrawal reason', withdrawalReason => {
    expect(WithdrawalReasonSchema.safeParse({ withdrawalReason }).success).toBe(true)
  })

  it('rejects an absent withdrawal reason', () => {
    const result = WithdrawalReasonSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Select why you are withdrawing the referral')
    }
  })

  it('requires additional information', () => {
    const result = WithdrawalFormDataSchema.safeParse({
      withdrawalReason: 'Not engaged',
      'Not engagedDetails': '  ',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Enter details')
    }
  })

  it('limits additional information to 2000 characters', () => {
    const validResult = WithdrawalFormDataSchema.safeParse({
      withdrawalReason: 'Not engaged',
      'Not engagedDetails': 'a'.repeat(2000),
    })
    const invalidResult = WithdrawalFormDataSchema.safeParse({
      withdrawalReason: 'Not engaged',
      'Not engagedDetails': 'a'.repeat(2001),
    })

    expect(validResult.success).toBe(true)
    expect(invalidResult.success).toBe(false)
    if (!invalidResult.success) {
      expect(invalidResult.error.issues[0].message).toBe('Additional information must be 2000 characters or less')
    }
  })
})
