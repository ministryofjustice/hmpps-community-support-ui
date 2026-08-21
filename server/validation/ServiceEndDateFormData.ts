import { z } from 'zod'
import { isBefore, isExists, startOfDay, addDays } from 'date-fns'

const DATE_REQUIRED_MESSAGE = 'Enter the date the service needs to be completed by'
const DATE_INVALID_MESSAGE = 'Enter a date in the correct format'
const DATE_BEFORE_TODAY_MESSAGE = 'The date the service needs to be completed by must be in the future'
const REASON_REQUIRED_MESSAGE = 'Enter why it needs to be completed by this date'

const parseDatePart = (value: string): number | undefined => {
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? undefined : parsed
}

export const ServiceEndDateSchema = z
  .object({
    'target_service_completion_date-day': z.string().trim(),
    'target_service_completion_date-month': z.string().trim(),
    'target_service_completion_date-year': z.string().trim(),
    target_service_completion_reason: z.string().trim().min(1, { error: REASON_REQUIRED_MESSAGE }),
  })
  .superRefine((data, ctx) => {
    const day = data['target_service_completion_date-day']
    const month = data['target_service_completion_date-month']
    const year = data['target_service_completion_date-year']

    const allDatePartsEmpty = day === '' && month === '' && year === ''
    if (allDatePartsEmpty) {
      ctx.addIssue({
        code: 'custom',
        path: ['target_service_completion_date'],
        message: DATE_REQUIRED_MESSAGE,
      })
      return
    }

    const parsedDay = parseDatePart(day)
    const parsedMonth = parseDatePart(month)
    const parsedYear = parseDatePart(year)

    if (!parsedDay || !parsedMonth || !parsedYear || !isExists(parsedYear, parsedMonth - 1, parsedDay)) {
      ctx.addIssue({
        code: 'custom',
        path: ['target_service_completion_date'],
        message: DATE_INVALID_MESSAGE,
      })
      return
    }

    const targetDate = startOfDay(new Date(parsedYear, parsedMonth - 1, parsedDay))
    const tomorrow = addDays(new Date(), 1)
    if (isBefore(targetDate, startOfDay(tomorrow))) {
      ctx.addIssue({
        code: 'custom',
        path: ['target_service_completion_date'],
        message: DATE_BEFORE_TODAY_MESSAGE,
      })
    }
  })

export type ServiceEndDateFormData = z.infer<typeof ServiceEndDateSchema>
