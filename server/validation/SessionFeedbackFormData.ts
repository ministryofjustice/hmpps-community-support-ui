import { z } from 'zod'

export const SessionFeedbackFormDataSchema = z.object({
  whatDidYouDo: z
    .string()
    .min(1, { message: 'Enter what you did in the session' })
    .max(3000, { message: 'What you did in the session must be 3000 characters or less' }),
  behaviour: z
    .string()
    .min(1, { message: 'Enter what {{ firstname }}’s engagement was like during the session' })
    .max(3000, {
      message: 'Details about {{ firstname }}’s engagement during the session must be 3000 characters or less',
    }),
  strengthsIdentified: z
    .string()
    .min(1, { message: 'Enter what strengths you identified' })
    .max(3000, { message: 'Strengths you identified must be 3000 characters or less' }),
})

export type SessionFeedbackFormData = z.infer<typeof SessionFeedbackFormDataSchema>
