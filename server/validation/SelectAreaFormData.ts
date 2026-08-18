import { z } from 'zod'

const NOTHING_SELECTED_ERROR = { error: 'Select the area you want to make a referral to' }

export const SelectAreaSchema = z.object({
  selectArea: z.string(NOTHING_SELECTED_ERROR).min(1, NOTHING_SELECTED_ERROR),
})

type SelectAreaSchemaFormData = z.infer<typeof SelectAreaSchema>
export default SelectAreaSchemaFormData
