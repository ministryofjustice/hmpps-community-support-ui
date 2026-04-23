import { z } from 'zod'

const YesOrNoSchema = z.enum(['Yes', 'No'])

export const RecordSessionAttendanceFormDataSchema = z.discriminatedUnion('attended', [
  z.object({ attended: z.literal('Yes') }),
  z.object({
    attended: z.literal('No'),
    happened: YesOrNoSchema,
  }),
])

type RecordSessionAttendanceFormData = z.infer<typeof RecordSessionAttendanceFormDataSchema>
export default RecordSessionAttendanceFormData
