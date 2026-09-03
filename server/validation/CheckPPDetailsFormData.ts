import { z } from 'zod'

const NOTHING_SELECTED_ERROR = { error: 'Select yes if these details are correct' }

export const CheckPPDetailsSchema = z.object({
  detailsCorrect: z.string(NOTHING_SELECTED_ERROR).min(1, NOTHING_SELECTED_ERROR),
})

type CheckPPDetailsSchemaFormData = z.infer<typeof CheckPPDetailsSchema>
export default CheckPPDetailsSchemaFormData
