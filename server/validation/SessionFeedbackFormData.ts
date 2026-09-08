import { z } from 'zod'

const maxCharacters = 3000

interface TextareaContent {
  nothingEnteredError: string
  tooManyCharactersError: string
}

export interface SessionFeedbackFormContent {
  whatDidYouDoTextarea: TextareaContent
  behaviourTextarea: TextareaContent
  strengthsIdentifiedTextarea: TextareaContent
}

const replaceMaxCharacters = (message: string): string =>
  message.replace('{{ maxCharacters }}', maxCharacters.toString())

export const SessionFeedbackFormDataSchemaBuilder = (content: SessionFeedbackFormContent) =>
  z.object({
    whatDidYouDo: z
      .string()
      .min(1, { message: content.whatDidYouDoTextarea.nothingEnteredError })
      .max(maxCharacters, {
        message: replaceMaxCharacters(content.whatDidYouDoTextarea.tooManyCharactersError),
      }),
    behaviour: z
      .string()
      .min(1, { message: content.behaviourTextarea.nothingEnteredError })
      .max(maxCharacters, {
        message: replaceMaxCharacters(content.behaviourTextarea.tooManyCharactersError),
      }),
    strengthsIdentified: z
      .string()
      .min(1, { message: content.strengthsIdentifiedTextarea.nothingEnteredError })
      .max(maxCharacters, {
        message: replaceMaxCharacters(content.strengthsIdentifiedTextarea.tooManyCharactersError),
      }),
  })

export type SessionFeedbackFormData = z.infer<ReturnType<typeof SessionFeedbackFormDataSchemaBuilder>>
