import { z } from 'zod'
import { isValid, isAfter, parse, addMonths, startOfDay, format } from 'date-fns'

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

  const preprocessSchema = z
    .union([z.string(), z.object({ day: z.string(), month: z.string(), year: z.string() })])
    .transform(val => {
      if (typeof val === 'string') {
        return val.trim()
      }
      const { day, month, year } = val
      if (!day?.trim() || !month?.trim() || !year?.trim()) {
        return ''
      }
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    })

  let dateSchema = preprocessSchema
    .refine(val => val.length > 0, { message: finalMessages.blank })
    .transform(dateStr => {
      if (!dateStr) return null
      const parsedDate = parse(dateStr, dateFormat, new Date())
      return isValid(parsedDate) ? parsedDate : null
    })
    .refine((date): date is Date => date !== null, { message: finalMessages.invalidFormat })

  if (minDate) {
    dateSchema = dateSchema.refine(date => isAfter(date, minDate), {
      message: finalMessages.tooEarly + format(minDate, 'd/M/yyyy'),
    })
  }

  if (maxMonthsFuture !== null && maxMonthsFuture !== undefined) {
    const maxAllowed = addMonths(startOfDay(new Date()), maxMonthsFuture)
    dateSchema = dateSchema.refine(date => !isAfter(date, maxAllowed), {
      message: finalMessages.tooFarFuture + format(maxAllowed, 'd/M/yyyy'),
    })
  }

  const result = dateSchema.safeParse(input)

  if (result.success) {
    return {
      isValid: true,
      parsedDate: result.data,
    }
  }
  return {
    isValid: false,
    error: result.error.issues[0]?.message,
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

  const timeSchema = z
    .object({
      hour: z.string().transform(v => v?.trim() ?? ''),
      minute: z.string().transform(v => v?.trim() ?? ''),
      meridiem: z.string().transform(v => v?.trim().toUpperCase() ?? ''),
    })
    .superRefine((data, ctx) => {
      if (!data.hour && !data.minute && !data.meridiem) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: finalMessages.blank })
        return
      }
      if (!data.hour) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: finalMessages.hourBlank, path: ['hour'] })
        return
      }
      if (!data.minute) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: finalMessages.minuteBlank, path: ['minute'] })
        return
      }
      if (!data.meridiem) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: finalMessages.meridiemBlank, path: ['meridiem'] })
        return
      }

      const h = parseInt(data.hour, 10)
      const m = parseInt(data.minute, 10)

      if (
        Number.isNaN(h) ||
        h < 1 ||
        h > 12 ||
        Number.isNaN(m) ||
        m < 0 ||
        m > 59 ||
        !['AM', 'PM'].includes(data.meridiem)
      ) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: finalMessages.invalidFormat })
      }
    })
    .transform(data => {
      const hourNum = parseInt(data.hour, 10)
      const minuteNum = parseInt(data.minute, 10)
      return `${hourNum.toString().padStart(2, '0')}:${minuteNum.toString().padStart(2, '0')} ${data.meridiem}`
    })

  const result = timeSchema.safeParse({ hour, minute, meridiem })

  if (result.success) return { isValid: true, parsedTime: result.data }
  return { isValid: false, error: result.error.issues[0]?.message }
}
