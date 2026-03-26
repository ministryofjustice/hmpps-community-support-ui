import { isValid, parse, addMonths, startOfDay, format } from 'date-fns'

export interface DateValidationResult {
  isValid: boolean
  error?: string
  parsedDate?: Date
}

export interface DateValidationOptions {
  dateFormat?: string
  minDate?: Date
  maxMonthsFuture?: number
  messages?: Partial<{
    blank: string
    invalidFormat: string
    tooEarly: string
    tooFarFuture: string
  }>
}

export function validateDate(
  input: string | { day: string; month: string; year: string },
  options: DateValidationOptions = {},
): DateValidationResult {
  const { dateFormat = 'd/M/yyyy', minDate = null, maxMonthsFuture = null, messages = {} } = options

  const defaultMessages = {
    blank: 'Enter the date',
    invalidFormat: 'Enter a date in the correct format, like 10/7/2025',
    tooEarly: 'The date must be after ',
    tooFarFuture: 'The date must be before ',
  }

  const finalMessages = { ...defaultMessages, ...messages }

  let dateStr: string

  if (typeof input === 'string') {
    dateStr = input.trim()
  } else {
    const { day, month, year } = input
    if (!day || !month || !year) {
      return {
        isValid: false,
        error: finalMessages.blank,
      }
    }
    dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  if (!dateStr) {
    return {
      isValid: false,
      error: finalMessages.blank,
    }
  }

  const parsed = parse(dateStr, dateFormat, new Date())

  if (!isValid(parsed)) {
    return {
      isValid: false,
      error: finalMessages.invalidFormat,
    }
  }

  if (minDate) {
    if (!isAfter(parsed, minDate)) {
      return {
        isValid: false,
        error: finalMessages.tooEarly + format(minDate, 'd/M/yyyy'),
      }
    }
  }

  if (maxMonthsFuture) {
    const maxAllowed = addMonths(startOfDay(new Date()), maxMonthsFuture)
    if (isAfter(parsed, maxAllowed)) {
      return {
        isValid: false,
        error: finalMessages.tooFarFuture + format(maxAllowed, 'd/M/yyyy'),
      }
    }
  }

  return {
    isValid: true,
    parsedDate: parsed,
  }
}

export interface TimeValidationOptions {
  messages?: Partial<{
    blank: string
    hourBlank: string
    minuteBlank: string
    meridiemBlank: string
    invalidFormat: string
  }>
}

export interface TimeValidationResult {
  isValid: boolean
  error?: string
  parsedTime?: string
}

export function validateTime(
  hour: string,
  minute: string,
  meridiem: string,
  options: TimeValidationOptions = {},
): TimeValidationResult {
  const { messages = {} } = options

  const defaultMessages = {
    blank: 'Enter the time',
    hourBlank: 'Time must include hour',
    minuteBlank: 'Time must include minute',
    meridiemBlank: 'Select whether the time is AM or PM',
    invalidFormat: 'Enter a time in the correct format',
  }

  const finalMessages = { ...defaultMessages, ...messages }

  const trimmedHour = hour?.trim()
  const trimmedMinute = minute?.trim()
  const trimmedMeridiem = meridiem?.trim().toUpperCase()

  if (!trimmedHour && !trimmedMinute && !trimmedMeridiem) {
    return {
      isValid: false,
      error: finalMessages.blank,
    }
  }
  if (!trimmedHour) {
    return {
      isValid: false,
      error: finalMessages.hourBlank,
    }
  }
  if (!trimmedMinute) {
    return {
      isValid: false,
      error: finalMessages.minuteBlank,
    }
  }
  if (!trimmedMeridiem) {
    return {
      isValid: false,
      error: finalMessages.meridiemBlank,
    }
  }
  const hourNum = parseInt(trimmedHour, 10)
  const minuteNum = parseInt(trimmedMinute, 10)
  if (Number.isNaN(hourNum) || hourNum < 1 || hourNum > 12) {
    return {
      isValid: false,
      error: finalMessages.invalidFormat,
    }
  }
  if (Number.isNaN(minuteNum) || minuteNum < 0 || minuteNum > 59) {
    return {
      isValid: false,
      error: finalMessages.invalidFormat,
    }
  }
  if (!['AM', 'PM'].includes(trimmedMeridiem)) {
    return {
      isValid: false,
      error: finalMessages.invalidFormat,
    }
  }

  const parsedTime = `${hourNum.toString().padStart(2, '0')}:${minuteNum.toString().padStart(2, '0')} ${trimmedMeridiem}`

  return {
    isValid: true,
    parsedTime,
  }
}

function isAfter(date: Date, reference: Date): boolean {
  return date > reference
}
