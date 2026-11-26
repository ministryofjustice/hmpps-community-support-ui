import { z } from 'zod'

export const NotesTypeSchema = z.object({
  noteType: z.literal(['CASE_NOTE', 'NON_CONTACT_SESSION'], { error: 'Select the type of note you want to add' }),
})

type NotesTypeFormData = z.infer<typeof NotesTypeSchema>
export default NotesTypeFormData
