import { z } from 'zod'

const SERVICE_DAYS_REQUIRED_MESSAGE = 'Enter the number of days you will use for this service'
const SERVICE_DAYS_INVALID_MESSAGE = 'The number of days you will use for this service must only include numbers 0 to 9'
const SERVICE_DAYS_OUT_OF_RANGE_MESSAGE = 'Number of days must be between 1 and 99'

export const ServiceDaysSchema = z.object({
  service_days: z
    .string()
    .nonempty({ error: SERVICE_DAYS_REQUIRED_MESSAGE })
    .regex(/^[0-9]*$/, { error: SERVICE_DAYS_INVALID_MESSAGE })
    .transform(x => parseInt(x, 10))
    .refine(x => x > 0, { error: SERVICE_DAYS_OUT_OF_RANGE_MESSAGE })
    .refine(x => x < 50, { error: SERVICE_DAYS_OUT_OF_RANGE_MESSAGE }),
})

export type ServiceDaysFormData = z.infer<typeof ServiceDaysSchema>
