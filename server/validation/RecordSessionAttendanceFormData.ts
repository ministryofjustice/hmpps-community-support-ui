import { z } from 'zod'

const YesOrNoSchema = z.enum(['Yes', 'No'], { error: 'Select yes if {{ firstname }} came to the appointment' })
const HappenedSchema = z.object({ happened: z.literal('Yes') })
const AttendedSchema = z.object({
  happened: z.literal('No'),
  attended: YesOrNoSchema,
})

export const RecordSessionAttendanceFormDataSchema = z.discriminatedUnion(
  'happened',
  [HappenedSchema, AttendedSchema],
  { error: 'Select yes if the session happened' },
)

type RecordSessionAttendanceFormData = z.infer<typeof RecordSessionAttendanceFormDataSchema>
export default RecordSessionAttendanceFormData
