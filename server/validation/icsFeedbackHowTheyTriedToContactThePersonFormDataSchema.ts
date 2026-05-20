import { z } from 'zod'

const icsFeedbackHowTheyTriedToContactThePersonFormDataSchema = (firstname: string) => {
  const emptyError = `Enter how you tried to contact ${firstname} and what you know about why they did not attend`
  const tooLongError = `How you tried to contact ${firstname} and what you know about why they did not attend must be 400 characters or less`
  return z.object({
    howTheyTriedToContactThePerson: z
      .string({ error: emptyError })
      .nonempty({
        error: emptyError,
      })
      .max(400, {
        error: tooLongError,
      }),
  })
}

export default icsFeedbackHowTheyTriedToContactThePersonFormDataSchema
