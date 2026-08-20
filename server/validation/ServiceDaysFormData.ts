import { z } from 'zod'

const SERVICE_DAYS_REQUIRED_MESSAGE = 'Enter the number of days you will use for this service'
const SERVICE_DAYS_INVALID_MESSAGE = 'The number of days you will use for this service must only include numbers 0 to 9'
const SERVICE_DAYS_OUT_OF_RANGE_MESSAGE = 'The number of days you will use for this service must be between 1 and 99'

export const ServiceDaysSchema = z
  .object({
    service_days: z.string().trim().min(1, { error: SERVICE_DAYS_REQUIRED_MESSAGE }),
  })
  .superRefine((data, ctx) => {
    const parsed = Number.parseInt(data.service_days, 10)

    if (Number.isNaN(parsed)) {
      ctx.addIssue({
        code: 'custom',
        path: ['service_days'],
        message: SERVICE_DAYS_INVALID_MESSAGE,
      })
      return
    }

    if (parsed < 1 || parsed > 99) {
      ctx.addIssue({
        code: 'custom',
        path: ['service_days'],
        message: SERVICE_DAYS_OUT_OF_RANGE_MESSAGE,
      })
    }
  })

export type ServiceDaysFormData = z.infer<typeof ServiceDaysSchema>
