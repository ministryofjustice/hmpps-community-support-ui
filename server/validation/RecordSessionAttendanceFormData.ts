import { z } from 'zod'

export const RecordSessionAttendanceFormDataSchema = z.object({
  happened: z.enum(['Yes', 'No'], { error: 'Select yes if the session happened' }),
})

type RecordSessionAttendanceFormData = z.infer<typeof RecordSessionAttendanceFormDataSchema>
export default RecordSessionAttendanceFormData
