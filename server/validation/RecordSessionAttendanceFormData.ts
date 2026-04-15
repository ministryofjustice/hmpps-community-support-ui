import { z } from 'zod'

export const RecordSessionAttendanceFormDataSchema = z.object()

type RecordSessionAttendanceFormData = z.infer<typeof RecordSessionAttendanceFormDataSchema>
export default RecordSessionAttendanceFormData
