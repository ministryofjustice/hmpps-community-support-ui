import { z } from 'zod'

export const SessionFeedbackFormDataSchema = z.object({
  whatDidYouDo: z
    .string()
    .min(1, { message: 'Enter what you did in the session' })
    .max(3000, { message: 'What you did in the session must be 3000 characters or less' }),
})

export type SessionFeedbackFormData = z.infer<typeof SessionFeedbackFormDataSchema>
