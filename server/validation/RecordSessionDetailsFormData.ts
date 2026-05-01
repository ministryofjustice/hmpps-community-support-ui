import { z } from 'zod'
import { RecordSessionAttendanceFormDataSchema } from './RecordSessionAttendanceFormData'

// Using coerce will turn empty strings or undefined values into 0
// Using zodNumber will throw an error when the input is empty
const zodNumber = (configure?: (num: z.ZodNumber) => z.ZodNumber) =>
  z.preprocess(
    value => {
      if (value === '' || value === undefined) return undefined
      return Number(value)
    },
    configure ? configure(z.number()) : z.number(),
  )

export const RecordSessionDetailsFormDataSchema = z.object({
  wasPersonLate: z.literal(['Yes', 'No']),
  lateReason: z.string(),
  'sessionDuration-hours': zodNumber(num => num.gte(0).lt(100)),
  'sessionDuration-minutes': zodNumber(num => num.gte(0).lt(60)),
})

type RecordSessionDetailsFormData = z.infer<typeof RecordSessionAttendanceFormDataSchema>
export default RecordSessionDetailsFormData
