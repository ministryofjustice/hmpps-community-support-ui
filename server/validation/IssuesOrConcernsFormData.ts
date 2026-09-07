import { z } from 'zod'

const MAX_CHAR = 3000

export const IssuesOrConcernsFormDataSchema = z.object({
  issuesOrConcerns: z
    .string()
    .max(MAX_CHAR, `Details of issues or concerns must be ${MAX_CHAR} characters or less`)
    .min(1, 'Enter any issues or concerns you identified'),
})

type IssuesOrConcernsFormData = z.infer<typeof IssuesOrConcernsFormDataSchema>
export default IssuesOrConcernsFormData
