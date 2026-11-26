import { z } from 'zod'
import { RecordSessionDetailsFormDataSchema } from './RecordSessionDetailsFormData'

describe('RecordSessionDetailsFormDataSchema', () => {
  const validFormData = {
    wasPersonLate: 'No',
    lateReason: '',
    'sessionDuration-hours': '',
    'sessionDuration-minutes': '',
  }

  const expectDurationError = (
    formData: typeof validFormData,
    expectedMessage: string,
    field: 'sessionDuration-hours' | 'sessionDuration-minutes',
  ) => {
    const result = RecordSessionDetailsFormDataSchema.safeParse(formData)

    expect(result.success).toBe(false)
    if (result.success) return

    expect(z.flattenError(result.error).fieldErrors[field]).toContain(expectedMessage)
  }

  it('requires a duration when both fields are blank', () => {
    expectDurationError(validFormData, 'Enter how long the session lasted', 'sessionDuration-hours')
  })

  it('requires hours when minutes are provided', () => {
    expectDurationError(
      { ...validFormData, 'sessionDuration-minutes': '15' },
      'How long the session lasted must include hours',
      'sessionDuration-hours',
    )
  })

  it('requires minutes when hours are provided', () => {
    expectDurationError(
      { ...validFormData, 'sessionDuration-hours': '1' },
      'How long the session lasted must include minutes',
      'sessionDuration-minutes',
    )
  })

  it('preserves numeric validation messages', () => {
    expectDurationError(
      { ...validFormData, 'sessionDuration-hours': 'invalid' },
      'Hour must only include numbers 0 to 9',
      'sessionDuration-hours',
    )
  })
})
