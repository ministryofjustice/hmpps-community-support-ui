import { z } from 'zod'
import { addDays, addYears, isAfter, isBefore, isExists, startOfDay } from 'date-fns'
import dateFormat from '../utils/dateFormat'

const MAX_CHAR = 65000

const NEW_SERVICE_END_DATE_REQUIRED_ERROR = { error: 'Enter the new service end date' }
const NEW_SERVICE_END_DATE_INVALID_ERROR = { error: 'Enter a date in the correct format, for example, 24 02 2027' }
const NEW_SERVICE_END_DATE_PAST_ERROR = { error: 'The new service end date must be in the future' }
const SERVICE_END_DATE_CHANGE_REASON_ERROR = { error: 'Enter why you are changing the service end date' }
const newServiceEndDateTooFarFutureError = (maxDate: Date) => ({
  error: `The new service end date must be before ${dateFormat(maxDate)}`,
})
const newServiceEndDateMissingFieldsError = (missingFields: string[]) => ({
  error:
    missingFields.length === 1
      ? `The new service end date must include ${missingFields[0]}`
      : `The new service end date must include ${missingFields[0]} and ${missingFields[1]}`,
})

const parseDatePart = (value: string | undefined): number | undefined => {
  if (!value || value.trim() === '') {
    return undefined
  }

  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? undefined : parsed
}

export const ActionPlanChangeServiceEndDateDataSchemaBuilder = () => {
  return z
    .object({
      NEW_SERVICE_END_DATE: z.string().trim().max(MAX_CHAR, NEW_SERVICE_END_DATE_REQUIRED_ERROR).optional(),
      'NEW_SERVICE_END_DATE-day': z.string().trim().optional(),
      'NEW_SERVICE_END_DATE-month': z.string().trim().optional(),
      'NEW_SERVICE_END_DATE-year': z.string().trim().optional(),
      SERVICE_END_DATE_CHANGE_REASON: z.string().max(MAX_CHAR, SERVICE_END_DATE_CHANGE_REASON_ERROR).optional(),
    })
    .superRefine((data, ctx) => {
      const day = data['NEW_SERVICE_END_DATE-day'] ?? ''
      const month = data['NEW_SERVICE_END_DATE-month'] ?? ''
      const year = data['NEW_SERVICE_END_DATE-year'] ?? ''
      const directValue = data.NEW_SERVICE_END_DATE?.trim()

      // check if any of the date parts are provided, if not, return an error
      const hasAnyDatePart = day !== '' || month !== '' || year !== '' || Boolean(directValue)
      if (!hasAnyDatePart) {
        ctx.addIssue({
          code: 'custom',
          path: ['NEW_SERVICE_END_DATE'],
          message: NEW_SERVICE_END_DATE_REQUIRED_ERROR.error,
        })
        return
      }

      // check if some of the date parts are missing, if so, return an error
      const missingFields = [
        ...(day === '' ? ['day'] : []),
        ...(month === '' ? ['month'] : []),
        ...(year === '' ? ['year'] : []),
      ]
      if (missingFields.length > 0 && missingFields.length < 3) {
        ctx.addIssue({
          code: 'custom',
          path: ['NEW_SERVICE_END_DATE'],
          message: newServiceEndDateMissingFieldsError(missingFields).error,
        })
        return
      }

      // parse the date parts, and check if they form a valid date
      const parsedDay = parseDatePart(day)
      const parsedMonth = parseDatePart(month)
      const parsedYear = parseDatePart(year)

      if (!parsedDay || !parsedMonth || !parsedYear || !isExists(parsedYear, parsedMonth - 1, parsedDay)) {
        ctx.addIssue({
          code: 'custom',
          path: ['NEW_SERVICE_END_DATE'],
          message: NEW_SERVICE_END_DATE_INVALID_ERROR.error,
        })
        return
      }

      // check if the target date is in the past
      const today = new Date()
      const targetDate = startOfDay(new Date(parsedYear, parsedMonth - 1, parsedDay))
      if (isBefore(targetDate, today)) {
        ctx.addIssue({
          code: 'custom',
          path: ['NEW_SERVICE_END_DATE'],
          message: NEW_SERVICE_END_DATE_PAST_ERROR.error,
        })
        return
      }

      // check if the target date is more than 10 years in the future
      const maxDate = startOfDay(addYears(addDays(today, -1), 10))
      if (isAfter(targetDate, maxDate)) {
        ctx.addIssue({
          code: 'custom',
          path: ['NEW_SERVICE_END_DATE'],
          message: newServiceEndDateTooFarFutureError(maxDate).error,
        })
        return
      }

      if (!data.SERVICE_END_DATE_CHANGE_REASON?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['SERVICE_END_DATE_CHANGE_REASON'],
          message: SERVICE_END_DATE_CHANGE_REASON_ERROR.error,
        })
      }
    })
}

export const ChangeServiceEndDateSchema = ActionPlanChangeServiceEndDateDataSchemaBuilder()
type ChangeServiceEndDateSchemaFormData = z.infer<typeof ChangeServiceEndDateSchema>
export default ChangeServiceEndDateSchemaFormData
