import { z } from 'zod'

const MAX_CHAR = 65000

const FREQUENCY_NOTHING_ENTERED_ERROR = { error: 'Enter how often the sessions will take place' }
const FREQUENCY_TOO_LONG = { error: 'Details about session frequency must be 65000 characters or less' }
const HOW_NOTHING_ENTERED_ERROR = { error: 'Select how the sessions will take place' }
const FORMAT_NOTHING_ENTERED_ERROR = { error: 'Select which format you will use for the sessions' }
const WHY_VIDEO_CALL_REQUIRED_ERROR = { error: 'Enter why the sessions are not in person' }
const WHY_PHONE_CALL_REQUIRED_ERROR = { error: 'Enter why the sessions are not in person' }

const toFormatValues = (format: string | string[] | undefined): string[] => {
  if (Array.isArray(format)) {
    return format
  }
  return format ? [format] : []
}

export const ActionPlanSessionDeliveryDetailsFormDataSchemaBuilder = () =>
  z
    .object({
      frequency: z.string().max(MAX_CHAR, FREQUENCY_TOO_LONG).optional(),
      how: z.string().optional(),
      format: z.union([z.string(), z.array(z.string())]).optional(),
      whyVideoCall: z.string().optional(),
      whyPhoneCall: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (!data.frequency?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['frequency'],
          message: FREQUENCY_NOTHING_ENTERED_ERROR.error,
        })
      }

      if (!data.how?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['how'],
          message: HOW_NOTHING_ENTERED_ERROR.error,
        })
      }

      const formatValues = toFormatValues(data.format)
      if (formatValues.length === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['format'],
          message: FORMAT_NOTHING_ENTERED_ERROR.error,
        })
      }

      if (data.how === 'VIDEO_CALL' && !data.whyVideoCall?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['whyVideoCall'],
          message: WHY_VIDEO_CALL_REQUIRED_ERROR.error,
        })
      }
      if (data.how === 'PHONE_CALL' && !data.whyPhoneCall?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['whyPhoneCall'],
          message: WHY_PHONE_CALL_REQUIRED_ERROR.error,
        })
      }
    })

export const AddSessionDetailsSchema = ActionPlanSessionDeliveryDetailsFormDataSchemaBuilder
type AddSessionDetailsSchemaFormData = z.infer<typeof AddSessionDetailsSchema>
export default AddSessionDetailsSchemaFormData
