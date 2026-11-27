import { isExists, startOfDay } from 'date-fns'
import { z } from 'zod'
import { globalContent } from '../../assets/content/GlobalContent'

const { errors, activity, title } = globalContent.referral.id.notes['non-contact-session-details']

const dateRegex: RegExp = /^$|^(\d{1,2})\/(\d{1,2})\/(\d{4})$/

const getDate = (dateStr: string): Date | undefined => {
  if (!dateRegex.test(dateStr)) {
    return undefined
  }
  const [dayStr, monthStr, yearStr] = dateStr.split('/')
  const day = parseInt(dayStr, 10)
  const month = parseInt(monthStr, 10)
  const year = parseInt(yearStr, 10)
  return isExists(year, month - 1, day) ? startOfDay(`${year}-${month}-${day}`) : undefined
}

const DateSchema = z
  .string()
  .nonempty({ error: errors.date.empty })
  .transform(getDate)
  .refine(data => data !== undefined, { error: errors.date.invalid })

const isNumeric = (value: string): boolean => !Number.isNaN(Number(value))

const minuteSchema = z
  .int({ error: errors.time.minute.empty })
  .min(0, { error: errors.time.minute.tooSmall })
  .max(59, { error: errors.time.minute.tooLarge })

const minuteStringSchema = z
  .string()
  .min(1, { error: errors.time.minute.empty })
  .refine(isNumeric, { error: errors.time.minute.number })
  .transform(Number)
  .pipe(minuteSchema)

const hourSchema = z.int({ error: 'must be a whole number' }).min(0, { error: 'must be zero or more' })

const hourStringSchema = z
  .string()
  .min(1, { error: errors.time.hour.empty })
  .refine(isNumeric, { error: errors.time.hour.number })
  .transform(Number)
  .pipe(hourSchema)

export const NonContactSessionDetailsSchema = z
  .object({
    date: DateSchema,
    'time-Hour': hourStringSchema,
    'time-Minute': minuteStringSchema,
    title: z
      .string()
      .min(1, { error: errors.title.empty })
      .max(title.maxLength, { error: errors.title.max.replace('{{ size }}', title.maxLength.toString()) }),
    activity: z
      .string()
      .trim()
      .min(1, { error: errors.activity.empty })
      .max(activity.maxLength, { error: errors.activity.max.replace('{{ size }}', errors.activity.max) }),
  })
  .refine(data => !(data['time-Hour'] === 0 && data['time-Minute'] === 0), {
    error: errors.time.empty,
    path: ['time-Hour'],
  })

type NonContactSessionDetailsData = z.infer<typeof NonContactSessionDetailsSchema>
export default NonContactSessionDetailsData
