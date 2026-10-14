import { z } from 'zod'
import { ActionPlanSessionDeliveryDetailsResponse } from '@community-support-api'

const buildNothingSelectedError = (firstName: string) => ({
  error: `Select yes if ${firstName} was involved in creating the action plan`,
})

const buildNothingEnteredError = (firstName: string) => ({
  error: `Enter details about why ${firstName} was not involved in creating the action plan`,
})

const buildMaxCharError = (firstName: string) => ({
  error: `Details about why ${firstName} was not involved in creating the action plan must be 65000 characters or less`,
})

const MAX_CHAR = 65000

const choiceValuesForKey = (
  sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse,
  key: string,
): string[] => {
  const question = sessionDeliveryDetails.questions.find(candidate => candidate.key === key)
  return (question?.choices ?? []).map(choice => choice.value)
}

export const ActionPlanUserInvolvementFormDataSchemaBuilder = (
  sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse,
  firstName: string,
) => {
  const userInvolvementChoices = choiceValuesForKey(sessionDeliveryDetails, 'USER_INVOLVEMENT_IN_ACTION_PLAN')

  return z
    .object({
      USER_INVOLVEMENT_IN_ACTION_PLAN: z.string().optional(),
      WHY_NOT_INVOLVED: z.string().max(MAX_CHAR, buildMaxCharError(firstName)).optional(),
    })
    .superRefine((data, ctx) => {
      if (!data.USER_INVOLVEMENT_IN_ACTION_PLAN?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['USER_INVOLVEMENT_IN_ACTION_PLAN'],
          message: buildNothingSelectedError(firstName).error,
        })
      } else if (!userInvolvementChoices.includes(data.USER_INVOLVEMENT_IN_ACTION_PLAN)) {
        ctx.addIssue({
          code: 'custom',
          path: ['USER_INVOLVEMENT_IN_ACTION_PLAN'],
          message: buildNothingSelectedError(firstName).error,
        })
      }
      if (data.USER_INVOLVEMENT_IN_ACTION_PLAN === 'NO' && !data.WHY_NOT_INVOLVED?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['WHY_NOT_INVOLVED'],
          message: buildNothingEnteredError(firstName).error,
        })
      }
    })
}

export const UserInvolvementSchema = ActionPlanUserInvolvementFormDataSchemaBuilder({ questions: [] }, '')
type UserInvolvementFormData = z.infer<typeof UserInvolvementSchema>
export default UserInvolvementFormData
