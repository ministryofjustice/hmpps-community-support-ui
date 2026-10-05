import { z } from 'zod'

export const ActionPlanActivityFormDataSchema = z.object({
  activityProvider: z.string().trim().min(1, { error: 'Enter who will deliver the activity' }),
  activityDescription: z.string().trim().min(1, { error: 'Enter what the activity involves' }),
  activityIndex: z.string().optional(),
})

export type ActionPlanActivityFormData = z.infer<typeof ActionPlanActivityFormDataSchema>
