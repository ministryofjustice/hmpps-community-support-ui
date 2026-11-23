import { z } from 'zod'

const icsFeedbackHowTheyTriedToContactThePersonFormDataSchema = () => {
  const contactAttemptsError = 'Enter how you tried to contact them'
  const reasonError = 'Enter a reason they did not attend'
  return z.object({
    howTheyTriedToContactThePerson: z
      .string({ error: contactAttemptsError })
      .trim()
      .min(1, {
        error: contactAttemptsError,
      })
      .max(400, {
        error: 'How you tried to contact them must be 400 characters or less',
      }),
    reasonsTheyDidNotAttend: z
      .string({ error: reasonError })
      .trim()
      .min(1, {
        error: reasonError,
      })
      .max(400, {
        error: 'A reason they did not attend must be 400 characters or less',
      }),
  })
}

export default icsFeedbackHowTheyTriedToContactThePersonFormDataSchema
