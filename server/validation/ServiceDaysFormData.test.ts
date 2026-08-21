import { ServiceEndDateSchema } from './ServiceEndDateFormData'

describe('ServiceEndDateSchema', () => {
  const validPayload = {
    'target_service_completion_date-day': '20',
    'target_service_completion_date-month': '12',
    'target_service_completion_date-year': '2099',
    target_service_completion_reason: 'Target date agreed with provider',
  }

  test('accepts a valid future date and reason', () => {
    const result = ServiceEndDateSchema.safeParse(validPayload)
    expect(result.success).toBe(true)
  })

  test('rejects blank date', () => {
    const result = ServiceEndDateSchema.safeParse({
      ...validPayload,
      'target_service_completion_date-day': '',
      'target_service_completion_date-month': '',
      'target_service_completion_date-year': '',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('Enter the date the service needs to be completed by')
  })

  test('rejects invalid date', () => {
    const result = ServiceEndDateSchema.safeParse({
      ...validPayload,
      'target_service_completion_date-day': '31',
      'target_service_completion_date-month': '2',
      'target_service_completion_date-year': '2027',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('Enter a date in the correct format')
  })

  test('rejects date before today', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const result = ServiceEndDateSchema.safeParse({
      ...validPayload,
      'target_service_completion_date-day': String(yesterday.getDate()),
      'target_service_completion_date-month': String(yesterday.getMonth() + 1),
      'target_service_completion_date-year': String(yesterday.getFullYear()),
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('The date the service needs to be completed by must be in the future')
  })

  test('rejects blank reason', () => {
    const result = ServiceEndDateSchema.safeParse({
      ...validPayload,
      target_service_completion_reason: '   ',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('Enter why it needs to be completed by this date')
  })
})
