import { addDays, addYears, startOfDay, subDays } from 'date-fns'
import { ChangeServiceEndDateSchema } from './ActionPlanChangeServiceEndDateFormData'
import dateFormat from '../utils/dateFormat'

describe('ChangeServiceEndDateSchema', () => {
  const validPayload = {
    'NEW_SERVICE_END_DATE-day': '10',
    'NEW_SERVICE_END_DATE-month': '10',
    'NEW_SERVICE_END_DATE-year': '2026',
    SERVICE_END_DATE_CHANGE_REASON: 'The service needs to continue longer',
  }

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(startOfDay(new Date('2026-10-09')))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('accepts a valid date and reason', () => {
    const result = ChangeServiceEndDateSchema.safeParse(validPayload)
    expect(result.success).toBe(true)
  })

  test('rejects when nothing is entered for the date', () => {
    const result = ChangeServiceEndDateSchema.safeParse({
      ...validPayload,
      'NEW_SERVICE_END_DATE-day': '',
      'NEW_SERVICE_END_DATE-month': '',
      'NEW_SERVICE_END_DATE-year': '',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('Enter the new service end date')
  })

  test('rejects an invalid date', () => {
    const result = ChangeServiceEndDateSchema.safeParse({
      ...validPayload,
      'NEW_SERVICE_END_DATE-day': '31',
      'NEW_SERVICE_END_DATE-month': '2',
      'NEW_SERVICE_END_DATE-year': '2027',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('Enter a date in the correct format, for example, 24 02 2027')
  })

  test('rejects when one date field is missing', () => {
    const result = ChangeServiceEndDateSchema.safeParse({
      ...validPayload,
      'NEW_SERVICE_END_DATE-day': '15',
      'NEW_SERVICE_END_DATE-month': '',
      'NEW_SERVICE_END_DATE-year': '2027',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('The new service end date must include month')
  })

  test('rejects when two date fields are missing', () => {
    const result = ChangeServiceEndDateSchema.safeParse({
      ...validPayload,
      'NEW_SERVICE_END_DATE-day': '15',
      'NEW_SERVICE_END_DATE-month': '',
      'NEW_SERVICE_END_DATE-year': '',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('The new service end date must include month and year')
  })

  test('rejects a past date', () => {
    const yesterday = subDays(new Date(), 1)

    const result = ChangeServiceEndDateSchema.safeParse({
      ...validPayload,
      'NEW_SERVICE_END_DATE-day': String(yesterday.getDate()),
      'NEW_SERVICE_END_DATE-month': String(yesterday.getMonth() + 1),
      'NEW_SERVICE_END_DATE-year': String(yesterday.getFullYear()),
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('The new service end date must be in the future')
  })

  test('rejects a date more than 10 years in the future', () => {
    const tooFarInFuture = addDays(addYears(new Date(), 10), 1)
    const maxDate = addYears(addDays(new Date(), -1), 10)

    const result = ChangeServiceEndDateSchema.safeParse({
      ...validPayload,
      'NEW_SERVICE_END_DATE-day': String(tooFarInFuture.getDate()),
      'NEW_SERVICE_END_DATE-month': String(tooFarInFuture.getMonth() + 1),
      'NEW_SERVICE_END_DATE-year': String(tooFarInFuture.getFullYear()),
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe(`The new service end date must be before ${dateFormat(maxDate)}`)
  })
})
