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
const HOURS_REQUIRED_ERROR = 'How long the session lasted must include hours'
const MINUTES_REQUIRED_ERROR = 'How long the session lasted must include minutes'
const EMPTY_DURATION_ERROR = 'Enter how long the session lasted'

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

const durationInput = (schema: z.ZodType<number>) =>
  z.preprocess(
    value => (value === undefined || value === null ? '' : String(value)),
    z.string().transform((value, ctx): number | '' => {
      if (value === '') return ''

      const result = schema.safeParse(value)
      if (!result.success) {
        result.error.issues.forEach(issue => ctx.addIssue({ code: 'custom', message: issue.message }))
        return z.NEVER
      }

      return result.data
    }),
  )

const checkLateReason = (val: { wasPersonLate: string; lateReason: string }) => {
  if (val.wasPersonLate === 'Yes') {
    return val.lateReason.length > 0
  }
  return true
}

const baseSchema = z.object({
  wasPersonLate: z.literal(['Yes', 'No'], { error: 'Select yes if they were late' }),
  lateReason: z.string(),
  'sessionDuration-hours': durationInput(hours),
  'sessionDuration-minutes': durationInput(minutes),
})

const durationFieldsSchema = baseSchema.pick({
  'sessionDuration-hours': true,
  'sessionDuration-minutes': true,
})

const durationFieldsAreValid = (payload: { value: unknown }): boolean =>
  durationFieldsSchema.safeParse(payload.value).success

export const RecordSessionDetailsFormDataSchema = baseSchema
  .refine(checkLateReason, {
    message: 'Enter a reason they were late',
    path: ['lateReason'],
  })
  .refine(val => !(val['sessionDuration-hours'] === '' && val['sessionDuration-minutes'] === ''), {
    message: EMPTY_DURATION_ERROR,
    path: ['sessionDuration-hours'],
    when: durationFieldsAreValid,
  })
  .refine(val => val['sessionDuration-hours'] !== '' || val['sessionDuration-minutes'] === '', {
    message: HOURS_REQUIRED_ERROR,
    path: ['sessionDuration-hours'],
    when: durationFieldsAreValid,
  })
  .refine(val => val['sessionDuration-minutes'] !== '' || val['sessionDuration-hours'] === '', {
    message: MINUTES_REQUIRED_ERROR,
    path: ['sessionDuration-minutes'],
    when: durationFieldsAreValid,
  })

type RecordSessionDetailsFormData = z.infer<typeof RecordSessionDetailsFormDataSchema>
export default RecordSessionDetailsFormData
