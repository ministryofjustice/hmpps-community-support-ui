import { z } from 'zod'

const MAX_CHAR = 3000

export const IssuesOrConcernsFormDataSchema = z.object({
  issuesOrConcerns: z
    .string()
    .trim()
    .max(MAX_CHAR, `Details of issues or concerns must be ${MAX_CHAR} characters or less`)
    .min(1, 'Enter issues or concerns you identified'),
  notifyProbationPractitioner: z.enum(['Yes', 'No'], {
    error: 'Select yes if the probation practitioner needs to know about these issues or concerns',
  }),
})

type IssuesOrConcernsFormData = z.infer<typeof IssuesOrConcernsFormDataSchema>
export default IssuesOrConcernsFormData
