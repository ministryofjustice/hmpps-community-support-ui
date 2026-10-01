import { z } from 'zod'
import { ActionPlanSessionDeliveryDetailsResponse } from '@community-support-api'

const buildNothingSelectedError = (endDate: string) => ({
  error: `Select yes if the service end date is still ${endDate}`,
})

const choiceValuesForKey = (
  sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse,
  key: string,
): string[] => {
  const question = sessionDeliveryDetails.questions.find(candidate => candidate.key === key)
  return (question?.choices ?? []).map(choice => choice.value)
}

export const ActionPlanServiceEndDateCheckFormDataSchemaBuilder = (
  sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse,
  endDate: string,
) => {
  const serviceEndDateCheckChoices = choiceValuesForKey(sessionDeliveryDetails, 'SERVICE_END_DATE_CHECK')

  const nothingSelectedError = buildNothingSelectedError(endDate)

  return z
    .object({
      SERVICE_END_DATE_CHECK: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (!data.SERVICE_END_DATE_CHECK?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['SERVICE_END_DATE_CHECK'],
          message: nothingSelectedError.error,
        })
      } else if (!serviceEndDateCheckChoices.includes(data.SERVICE_END_DATE_CHECK)) {
        ctx.addIssue({
          code: 'custom',
          path: ['SERVICE_END_DATE_CHECK'],
          message: nothingSelectedError.error,
        })
      }
    })
}

export const ServiceEndDateCheckSchema = ActionPlanServiceEndDateCheckFormDataSchemaBuilder({ questions: [] }, '')
type ServiceEndDateCheckFormData = z.infer<typeof ServiceEndDateCheckSchema>
export default ServiceEndDateCheckFormData
