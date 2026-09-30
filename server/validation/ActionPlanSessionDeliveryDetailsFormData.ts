import { z } from 'zod'
import { ActionPlanSessionDeliveryDetailsResponse } from '@community-support-api'

const MAX_CHAR = 65000

const FREQUENCY_NOTHING_ENTERED_ERROR = { error: 'Enter how often the sessions will take place' }
const FREQUENCY_TOO_LONG = { error: 'Details about session frequency must be 65000 characters or less' }
const HOW_NOTHING_ENTERED_ERROR = { error: 'Select how the sessions will take place' }
const HOW_UNKNOWN_VALUE_ERROR = { error: 'Select how the sessions will take place' }
const FORMAT_NOTHING_ENTERED_ERROR = { error: 'Select which format you will use for the sessions' }
const FORMAT_UNKNOWN_VALUE_ERROR = { error: 'Select which format you will use for the sessions' }
const WHY_VIDEO_CALL_REQUIRED_ERROR = { error: 'Enter why the sessions are not in person' }
const WHY_PHONE_CALL_REQUIRED_ERROR = { error: 'Enter why the sessions are not in person' }

const toFormatValues = (format: string | string[] | undefined): string[] => {
  if (Array.isArray(format)) {
    return format
  }
  return format ? [format] : []
}

const choiceValuesForKey = (
  sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse,
  key: string,
): string[] => {
  const question = sessionDeliveryDetails.questions.find(candidate => candidate.key === key)
  return (question?.choices ?? []).map(choice => choice.value)
}

export const ActionPlanSessionDeliveryDetailsFormDataSchemaBuilder = (
  sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse,
) => {
  const deliveryMethodChoices = choiceValuesForKey(sessionDeliveryDetails, 'SESSION_DELIVERY_METHOD')
  const formatChoices = choiceValuesForKey(sessionDeliveryDetails, 'SESSION_FORMAT')

  return z
    .object({
      SESSION_FREQUENCY: z.string().max(MAX_CHAR, FREQUENCY_TOO_LONG).optional(),
      SESSION_DELIVERY_METHOD: z.string().optional(),
      SESSION_FORMAT: z.union([z.string(), z.array(z.string())]).optional(),
      VIDEO_CALL: z.string().optional(),
      PHONE_CALL: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (!data.SESSION_FREQUENCY?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['SESSION_FREQUENCY'],
          message: FREQUENCY_NOTHING_ENTERED_ERROR.error,
        })
      }

      if (!data.SESSION_DELIVERY_METHOD?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['SESSION_DELIVERY_METHOD'],
          message: HOW_NOTHING_ENTERED_ERROR.error,
        })
      } else if (!deliveryMethodChoices.includes(data.SESSION_DELIVERY_METHOD)) {
        ctx.addIssue({
          code: 'custom',
          path: ['SESSION_DELIVERY_METHOD'],
          message: HOW_UNKNOWN_VALUE_ERROR.error,
        })
      }

      const formatValues = toFormatValues(data.SESSION_FORMAT)
      if (formatValues.length === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['SESSION_FORMAT'],
          message: FORMAT_NOTHING_ENTERED_ERROR.error,
        })
      } else if (formatValues.some(value => !formatChoices.includes(value))) {
        ctx.addIssue({
          code: 'custom',
          path: ['SESSION_FORMAT'],
          message: FORMAT_UNKNOWN_VALUE_ERROR.error,
        })
      }

      if (data.SESSION_DELIVERY_METHOD === 'VIDEO_CALL' && !data.VIDEO_CALL?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['VIDEO_CALL'],
          message: WHY_VIDEO_CALL_REQUIRED_ERROR.error,
        })
      }
      if (data.SESSION_DELIVERY_METHOD === 'PHONE_CALL' && !data.PHONE_CALL?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['PHONE_CALL'],
          message: WHY_PHONE_CALL_REQUIRED_ERROR.error,
        })
      }
    })
}

export const AddSessionDetailsSchema = ActionPlanSessionDeliveryDetailsFormDataSchemaBuilder({ questions: [] })
type AddSessionDetailsSchemaFormData = z.infer<typeof AddSessionDetailsSchema>
export default AddSessionDetailsSchemaFormData
