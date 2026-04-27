import { z } from 'zod'

const YesOrNoSchema = z.enum(['Yes', 'No'])

export const RecordSessionAttendanceFormDataSchema = z.discriminatedUnion('happened', [
  z.object({ happened: z.literal('Yes') }),
  z.object({
    happened: z.literal('No'),
    attended: YesOrNoSchema,
  }),
])

type RecordSessionAttendanceFormData = z.infer<typeof RecordSessionAttendanceFormDataSchema>
export default RecordSessionAttendanceFormData
