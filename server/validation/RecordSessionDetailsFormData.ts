import { z } from 'zod'

const HOURS_TOO_MANY_CHAR_ERROR = {
  error: 'Hour must be 2 characters or less',
}
const MINUTES_TOO_MANY_CHAR_ERROR = {
  error: 'Minute must be 2 characters or less',
}
const INVALID_HOURS_ERROR = {
  error: 'Hour must only include numbers 0 to 9',
}
const INVALID_MINUTES_ERROR = {
  error: 'Minute must only include numbers 0 to 9',
}
const HOURS_OOB_ERROR = {
  error: 'Hour must be positive',
}
const MINUTES_OOB_ERROR = {
  error: 'Minute must be between 0 and 60',
}

const hours = z.coerce
  .number(INVALID_HOURS_ERROR)
  .int(INVALID_HOURS_ERROR)
  .gte(0, HOURS_OOB_ERROR)
  .max(99, HOURS_TOO_MANY_CHAR_ERROR)

const minutes = z.coerce
  .number(INVALID_MINUTES_ERROR)
  .int(INVALID_MINUTES_ERROR)
  .gte(0, MINUTES_OOB_ERROR)
  .superRefine((val, ctx) => {
    if (val > 99) {
      ctx.addIssue(MINUTES_TOO_MANY_CHAR_ERROR.error)
    } else if (val > 59) {
      ctx.addIssue(MINUTES_OOB_ERROR.error)
    }
  })

const checkDuration = (val: { 'sessionDuration-hours': number; 'sessionDuration-minutes': number }) => {
  return !(val['sessionDuration-hours'] === 0 && val['sessionDuration-minutes'] === 0)
}

const checkLateReason = (val: { wasPersonLate: string; lateReason: string }) => {
  if (val.wasPersonLate === 'Yes') {
    return val.lateReason.length > 0
  }
  return true
}

const baseSchema = z.object({
  wasPersonLate: z.literal(['Yes', 'No'], { error: 'Select yes if {{ firstname }} was late' }),
  lateReason: z.string(),
  'sessionDuration-hours': hours,
  'sessionDuration-minutes': minutes,
})

export const RecordSessionDetailsFormDataSchema = baseSchema
  .refine(checkLateReason, {
    message: 'Enter why {{ firstname }} was late',
    path: ['lateReason'],
  })
  .refine(checkDuration, {
    message: 'Enter how long the session lasted',
    path: ['sessionDuration-hours'],

    when(payload) {
      return baseSchema
        .pick({ 'sessionDuration-hours': true, 'sessionDuration-minutes': true })
        .safeParse(payload.value).success
    },
  })

type RecordSessionDetailsFormData = z.infer<typeof RecordSessionDetailsFormDataSchema>
export default RecordSessionDetailsFormData
