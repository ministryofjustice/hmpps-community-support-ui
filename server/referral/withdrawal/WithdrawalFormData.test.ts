import {
  WithdrawalConfirmationSchema,
  WithdrawalFormDataSchema,
  WithdrawalReasonSchema,
  withdrawalReasons,
} from './WithdrawalFormData'

describe('withdrawal form validation', () => {
  it.each(withdrawalReasons)('accepts %s as a withdrawal reason', withdrawalReason => {
    expect(WithdrawalReasonSchema.safeParse({ withdrawalReason }).success).toBe(true)
  })

  it('rejects an absent withdrawal reason', () => {
    const result = WithdrawalReasonSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Select a reason for withdrawing the referral')
    }
  })

  it('requires additional information', () => {
    const result = WithdrawalFormDataSchema.safeParse({
      withdrawalReason: 'NOT_ENGAGED',
      NOT_ENGAGEDDetails: '  ',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Enter additional information about why the referral is being withdrawn',
      )
    }
  })

  it('limits additional information to 2000 characters', () => {
    const validResult = WithdrawalFormDataSchema.safeParse({
      withdrawalReason: 'NOT_ENGAGED',
      NOT_ENGAGEDDetails: 'a'.repeat(2000),
    })
    const invalidResult = WithdrawalFormDataSchema.safeParse({
      withdrawalReason: 'NOT_ENGAGED',
      NOT_ENGAGEDDetails: 'a'.repeat(2001),
    })

    expect(validResult.success).toBe(true)
    expect(invalidResult.success).toBe(false)
    if (!invalidResult.success) {
      expect(invalidResult.error.issues[0].message).toBe('Additional information must be 2000 characters or less')
    }
  })

  it('requires a confirmation choice', () => {
    expect(WithdrawalConfirmationSchema.safeParse({}).success).toBe(false)
    expect(WithdrawalConfirmationSchema.safeParse({ confirmWithdrawal: 'yes' }).success).toBe(true)
  })
})
