import { z } from 'zod'

export const ActionPlanRemoveActivityFormDataSchema = z.object({
  removeActivity: z.enum(['yes', 'no'], { error: 'Select yes if you want to remove this activity' }),
})

export type ActionPlanRemoveActivityFormData = z.infer<typeof ActionPlanRemoveActivityFormDataSchema>
