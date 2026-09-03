import { z } from 'zod'
import { globalContent } from '../../assets/content/GlobalContent'

const { whatDidYouDoTextarea, behaviourTextarea, strengthsIdentifiedTextarea } =
  globalContent['/ics-feedback/:id/session-feedback'].feedbackForm

const maxCharacters = 3000

export const SessionFeedbackFormDataSchema = z.object({
  whatDidYouDo: z
    .string()
    .min(1, { message: whatDidYouDoTextarea.nothingEnteredError })
    .max(maxCharacters, {
      message: whatDidYouDoTextarea.tooManyCharactersError.replace('{{ maxCharacters }}', maxCharacters.toString()),
    }),
  behaviour: z
    .string()
    .min(1, { message: behaviourTextarea.nothingEnteredError })
    .max(3000, {
      message: behaviourTextarea.tooManyCharactersError.replace('{{ maxCharacters}}', maxCharacters.toString()),
    }),
  strengthsIdentified: z
    .string()
    .min(1, { message: strengthsIdentifiedTextarea.nothingEnteredError })
    .max(maxCharacters, {
      message: strengthsIdentifiedTextarea.tooManyCharactersError.replace('{{ maxCharacters }}', maxCharacters.toString()),
    }),
})

export type SessionFeedbackFormData = z.infer<typeof SessionFeedbackFormDataSchema>
