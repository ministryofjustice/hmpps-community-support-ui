import { z } from 'zod'

const MAX_CHARS = 500

const NOTHING_SELECTED_ERROR = { error: 'Select who requested this change' }
const REASON_EMPTY_ERROR = { error: 'Enter the reason for this change' }
const REASON_TOO_MANY_CHARS_ERROR = { error: `Reason for change must be ${MAX_CHARS} characters or less` }

export const ChangeIcsDetailsReasonSchema = z.object({
  requestedBy: z.string(NOTHING_SELECTED_ERROR),
  reasonForChange: z.string().min(1, REASON_EMPTY_ERROR).max(MAX_CHARS, REASON_TOO_MANY_CHARS_ERROR),
})

type ChangeIcsDetailsReasonFormData = z.infer<typeof ChangeIcsDetailsReasonSchema>
export default ChangeIcsDetailsReasonFormData
