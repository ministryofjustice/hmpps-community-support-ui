import z from 'zod'

const MAX_TITLE_LENGTH = 100
const MAX_DETAILS_LENGTH = 12000

const NO_TITLE_ERROR = { error: 'Enter a title for the case note' }
const NO_DETAILS_ERROR = { error: 'Enter the details of the case note' }

export const CaseNoteDetailsSchema = z.object({
  titleInput: z
    .string(NO_TITLE_ERROR)
    .min(1, NO_TITLE_ERROR)
    .max(MAX_TITLE_LENGTH, { error: `Case note title must be ${MAX_TITLE_LENGTH} characters or less` }),
  detailsInput: z
    .string(NO_DETAILS_ERROR)
    .min(1, NO_DETAILS_ERROR)
    .max(MAX_DETAILS_LENGTH, { error: `Case note details must be ${MAX_DETAILS_LENGTH} characters or less` }),
  shouldNotify: z.literal(['yes', 'no'], {
    error: 'Select whether you want to send an email to the probation practitioner',
  }),
})

type CaseNoteDetailsFormData = z.infer<typeof CaseNoteDetailsSchema>
export default CaseNoteDetailsFormData
