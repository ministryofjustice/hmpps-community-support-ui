import { z } from 'zod'

const NOTHING_SELECTED_ERROR = { error: 'Select who requested this change' }

export const SelectAreaSchema = z.object({
  selectArea: z.string(NOTHING_SELECTED_ERROR),
})

type SelectAreaSchemaFormData = z.infer<typeof SelectAreaSchema>
export default SelectAreaSchemaFormData
