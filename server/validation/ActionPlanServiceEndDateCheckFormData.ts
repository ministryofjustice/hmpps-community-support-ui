import { z } from 'zod'
import { ActionPlanSessionDeliveryDetailsResponse } from '@community-support-api'

const buildNothingSelectedError = (endDate: string) => ({
  error: `Select yes if the service end date is still ${endDate}`,
})

export const getServiceEndDateValue = (sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse): string => {
  const serviceEndDateCheckQuestion = sessionDeliveryDetails.questions.find(
    question => question.key === 'SERVICE_END_DATE_CHECK',
  )
  const match = serviceEndDateCheckQuestion?.label.match(/(\d{1,2}\s+[A-Za-z]+\s+\d{4})/)
  return match?.[1] ?? 'the service end date'
}

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

  const nothingSelectedError = buildNothingSelectedError(endDate || 'the service end date')

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
