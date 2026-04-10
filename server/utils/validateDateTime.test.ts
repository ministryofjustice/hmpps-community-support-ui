import { format, addDays, addMonths } from 'date-fns'
import { validateDate, validateTime } from './validateDateTime'

describe('validateDateTime tests', () => {
  it('check blank date', () => {
    const result = validateDate('')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('Enter the date')
  })

  it('check invalid date form', () => {
    const result = validateDate('32/01/2025')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('Enter a date in the correct format')
  })

  it('check date in the past', () => {
    const result = validateDate('31/12/2025', { minDate: new Date('2026-01-01') })
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('The date must be after')
  })

  it('check date in the past - edge case', () => {
    const result = validateDate('01/01/2026', { minDate: new Date('2026-01-01') })
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('The date must be after')
  })

  it('check date too far in future', () => {
    const farFuture = format(addMonths(new Date(), 7), 'dd/MM/yyyy')
    const result = validateDate(farFuture, { maxMonthsFuture: 6 })
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('The date must be before')
  })

  it('check date too far in future - edge case - 1 day after', () => {
    const farFuture = format(addDays(addMonths(new Date(), 6), 1), 'dd/MM/yyyy')
    const result = validateDate(farFuture, { maxMonthsFuture: 6 })
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('The date must be before')
  })

  it('check date too far in future - edge case - 1 day before', () => {
    const farFuture = format(addDays(addMonths(new Date(), 6), -1), 'dd/MM/yyyy')
    const result = validateDate(farFuture, { maxMonthsFuture: 6 })
    expect(result.isValid).toBe(true)
  })

  it('check a valid time', () => {
    const result = validateTime('9', '10', 'AM')
    expect(result.isValid).toBe(true)
    expect(result.parsedTime).toBe('09:10 AM')
  })

  it('check blank time', () => {
    const result = validateTime('', '', '')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('Enter the time')
  })

  it('check blank hour', () => {
    const result = validateTime('', '10', 'AM')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('Time must include hour')
  })

  it('check blank minute', () => {
    const result = validateTime('10', '', 'AM')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('Time must include minute')
  })

  it('check blank minute', () => {
    const result = validateTime('10', '10', '')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('Select whether the time is AM or PM')
  })

  it('check invalid hour', () => {
    const result = validateTime('13', '10', 'AM')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('Enter a time in the correct format')
  })

  it('check invalid minute', () => {
    const result = validateTime('12', '68', 'AM')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('Enter a time in the correct format')
  })
})
