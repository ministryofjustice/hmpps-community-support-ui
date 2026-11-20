import { z } from 'zod'

export const NO_PATHWAY_VALUE = 'NONE'
export const CASE_NOTE_PATHWAY_ERROR =
  "Select what pathway this case note relates to, or select 'it does not relate to a pathway'"
export const NON_CONTACT_SESSION_PATHWAY_ERROR = 'Select at least one pathway'

export const buildNotesPathwaysSchema = (isCaseNote: boolean) => {
  const error = isCaseNote ? CASE_NOTE_PATHWAY_ERROR : NON_CONTACT_SESSION_PATHWAY_ERROR
  return z.object({
    pathways: z.preprocess(
      value => {
        if (value === undefined) return []
        return Array.isArray(value) ? value : [value]
      },
      z
        .array(z.string(), { error })
        .min(1, { error })
        .refine(arr => (arr.includes(NO_PATHWAY_VALUE) ? arr.length === 1 : true), { error }),
    ),
  })
}

type NotesPathwaysFormData = z.infer<ReturnType<typeof buildNotesPathwaysSchema>>
export default NotesPathwaysFormData
