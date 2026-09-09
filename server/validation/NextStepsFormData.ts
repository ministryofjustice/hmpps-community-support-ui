import { z } from 'zod'

const MAX_CHAR = 3000

export const NextStepsFormDataSchema = z.object({
  plannedForNextSession: z
    .string()
    .trim()
    .min(1, 'Enter what you have planned for the next session')
    .max(MAX_CHAR, `Details about what you have planned for the next session must be ${MAX_CHAR} characters or less`),
  actionsBeforeNextSession: z
    .string()
    .trim()
    .min(1, 'Enter what actions you have before the next session takes place ')
    .max(
      MAX_CHAR,
      `Details about what actions you have before the next session takes place must be ${MAX_CHAR} characters or less`,
    ),
})

export type NextStepsFormData = z.infer<typeof NextStepsFormDataSchema>

export default NextStepsFormDataSchema
