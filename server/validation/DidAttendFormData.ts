import { z } from 'zod'

export const DidAttendFormDataSchema = z.object({
  didAttend: z.enum(['Yes', 'No'], { error: 'Select yes if they came to the appointment' }),
})

type DidAttendFormData = z.infer<typeof DidAttendFormDataSchema>
export default DidAttendFormData
