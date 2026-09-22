import { z } from 'zod'

const MAX_ADDITIONAL_INFORMATION_LENGTH = 2000
const SELECT_WITHDRAWAL_REASON_ERROR = 'Select why you are withdrawing the referral'

export type WithdrawalReason = string

export interface WithdrawalFormData {
  withdrawalReason: WithdrawalReason
  additionalInformation: string
}

export type AdditionalInformationField = `${WithdrawalReason}Details`

export const additionalInformationField = (reason: WithdrawalReason): AdditionalInformationField => `${reason}Details`

export const createWithdrawalReasonSchema = (withdrawalReasons: string[]) =>
  z.looseObject({
    withdrawalReason: z
      .string({ error: SELECT_WITHDRAWAL_REASON_ERROR })
      .trim()
      .min(1, { error: SELECT_WITHDRAWAL_REASON_ERROR })
      .refine(reason => withdrawalReasons.includes(reason), { error: SELECT_WITHDRAWAL_REASON_ERROR }),
  })

export const createWithdrawalFormDataSchema = (withdrawalReasons: string[]) =>
  createWithdrawalReasonSchema(withdrawalReasons)
    .superRefine((data, context) => {
      const field = additionalInformationField(data.withdrawalReason)
      const additionalInformation = typeof data[field] === 'string' ? data[field].trim() : undefined

      if (!additionalInformation) {
        context.addIssue({
          code: 'custom',
          message: 'Enter details',
          path: [field],
        })
      } else if (additionalInformation.length > MAX_ADDITIONAL_INFORMATION_LENGTH) {
        context.addIssue({
          code: 'custom',
          message: `Additional information must be ${MAX_ADDITIONAL_INFORMATION_LENGTH} characters or less`,
          path: [field],
        })
      }
    })
    .transform(data => {
      const field = additionalInformationField(data.withdrawalReason)
      const additionalInformation = data[field]

      if (typeof additionalInformation !== 'string') {
        throw new Error(`Expected ${field} to be a string`)
      }

      return {
        withdrawalReason: data.withdrawalReason,
        additionalInformation: additionalInformation.trim(),
      } satisfies WithdrawalFormData
    })
