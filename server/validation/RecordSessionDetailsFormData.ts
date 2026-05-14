import { z } from 'zod'
import { RecordSessionAttendanceFormDataSchema } from './RecordSessionAttendanceFormData'

const INVALID_HOURS_ERROR_MESSAGE = 'Invalid hours - Please enter a number between 0 and 99'
const INVALID_MINUTES_ERROR_MESSAGE = 'Invalid minutes - Please enter a number between 0 and 59'

// Using coerce will turn empty strings or undefined values into 0
// Using zodNumber will throw an error when the input is empty
const zodNumber = (configure?: (num: z.ZodNumber) => z.ZodNumber, errorMessage?: string) =>
  z.preprocess(
    value => {
      if (value === '' || value === undefined) return undefined
      return Number(value)
    },
    configure ? configure(z.number({ error: errorMessage })) : z.number({ error: errorMessage }),
  )

export const RecordSessionDetailsFormDataSchema = z.object({
  wasPersonLate: z.literal(['Yes', 'No'], { error: 'Please select Yes or No' }),
  lateReason: z.string(),
  'sessionDuration-hours': zodNumber(
    num => num.gte(0, { error: INVALID_HOURS_ERROR_MESSAGE }).lt(100, { error: INVALID_HOURS_ERROR_MESSAGE }),
    INVALID_HOURS_ERROR_MESSAGE,
  ),
  'sessionDuration-minutes': zodNumber(
    num => num.gte(0, { error: INVALID_MINUTES_ERROR_MESSAGE }).lt(60, { error: INVALID_MINUTES_ERROR_MESSAGE }),
    INVALID_MINUTES_ERROR_MESSAGE,
  ),
})

type RecordSessionDetailsFormData = z.infer<typeof RecordSessionAttendanceFormDataSchema>
export default RecordSessionDetailsFormData
