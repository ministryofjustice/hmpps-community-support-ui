import { z } from 'zod'
import { ActionPlanSessionDeliveryDetailsResponse } from '@community-support-api'

const RISK_NOTHING_SELECTED_ERROR = {
  error: 'Select yes if there are any risks associated with the planned activities',
}
const buildAdjustmentsNothingSelectedError = (firstName: string) => ({
  error: `Select yes if you will put any reasonable adjustments in place to help ${firstName} take part in the planned activities`,
})
const RISK_NOTHING_ENTERED_ERROR = {
  error: 'Enter details about the risks and what you will put in place to reduce them',
}
const ADJUSTMENTS_NOTHING_ENTERED_ERROR = { error: 'Enter details about what adjustments you will make' }

const choiceValuesForKey = (
  sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse,
  key: string,
): string[] => {
  const question = sessionDeliveryDetails.questions.find(candidate => candidate.key === key)
  return (question?.choices ?? []).map(choice => choice.value)
}

export const ActionPlanRisksAndAdjustmentsFormDataSchemaBuilder = (
  sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse,
  firstName: string,
) => {
  const riskWithActivitiesChoices = choiceValuesForKey(
    sessionDeliveryDetails,
    'RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES',
  )
  const adjustmentsForActivitiesChoices = choiceValuesForKey(
    sessionDeliveryDetails,
    'REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES',
  )
  const adjustmentsNothingSelectedError = buildAdjustmentsNothingSelectedError(firstName)

  return z
    .object({
      RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES: z.string().optional(),
      REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES: z.string().optional(),
      RISK_INFO: z.string().optional(),
      ADJUSTMENT_INFO: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (!data.RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES'],
          message: RISK_NOTHING_SELECTED_ERROR.error,
        })
      } else if (!riskWithActivitiesChoices.includes(data.RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES)) {
        ctx.addIssue({
          code: 'custom',
          path: ['RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES'],
          message: RISK_NOTHING_SELECTED_ERROR.error,
        })
      }
      if (!data.REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES'],
          message: adjustmentsNothingSelectedError.error,
        })
      } else if (!adjustmentsForActivitiesChoices.includes(data.REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES)) {
        ctx.addIssue({
          code: 'custom',
          path: ['REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES'],
          message: adjustmentsNothingSelectedError.error,
        })
      }
      if (data.RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES === 'YES' && !data.RISK_INFO?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['RISK_INFO'],
          message: RISK_NOTHING_ENTERED_ERROR.error,
        })
      }
      if (data.REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES === 'YES' && !data.ADJUSTMENT_INFO?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['ADJUSTMENT_INFO'],
          message: ADJUSTMENTS_NOTHING_ENTERED_ERROR.error,
        })
      }
    })
}

export const RisksAndAdjustmentsSchema = ActionPlanRisksAndAdjustmentsFormDataSchemaBuilder({ questions: [] }, '')
type RisksAndAdjustmentsFormData = z.infer<typeof RisksAndAdjustmentsSchema>
export default RisksAndAdjustmentsFormData
