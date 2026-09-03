import { ServiceDaysSchema } from './ServiceDaysFormData'

describe('ServiceDaysSchema', () => {
  test('accepts a valid service days', () => {
    const result = ServiceDaysSchema.safeParse({ serviceDays: '5' })
    expect(result.success).toBe(true)
  })

  test('accepts a valid service days white space trimmed', () => {
    const result = ServiceDaysSchema.safeParse({ serviceDays: ' 5 ' })
    expect(result.success).toBe(true)
  })

  test('rejects blank service days', () => {
    const result = ServiceDaysSchema.safeParse({ serviceDays: '' })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('Enter the number of days you will use for this service')
  })

  test('rejects invalid service days', () => {
    const result = ServiceDaysSchema.safeParse({ serviceDays: 'abc' })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe(
      'The number of days you will use for this service must only include numbers 0 to 9',
    )
  })

  test('rejects service days out of range too low', () => {
    const result = ServiceDaysSchema.safeParse({ serviceDays: '0' })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('Number of days must be between 1 and 99')
  })

  test('rejects service days out of range too high', () => {
    const result = ServiceDaysSchema.safeParse({ serviceDays: '100' })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('Number of days must be between 1 and 99')
  })
})
