import { z } from 'zod'

export const withdrawalReasons = [
  'INELIGIBLE_REFERRAL',
  'MISTAKEN_OR_DUPLICATE_REFERRAL',
  'NOT_ENGAGED',
  'NEEDS_MET_THROUGH_ANOTHER_ROUTE',
  'USER_DIED',
  'WORK_CARING_COMMITMENTS_OR_SICKNESS',
  'ACQUITTED_ON_APPEAL',
  'RETURNED_TO_CUSTODY',
  'SENTENCE_REVOKED',
  'SENTENCE_EXPIRED',
  'OTHER_CHANGE_OF_CIRCUMSTANCE',
] as const

const MAX_ADDITIONAL_INFORMATION_LENGTH = 2000

export type WithdrawalReason = (typeof withdrawalReasons)[number]

export type AdditionalInformationField = `${WithdrawalReason}Details`

export const additionalInformationField = (reason: WithdrawalReason): AdditionalInformationField => `${reason}Details`

const additionalInformationFields = Object.fromEntries(
  withdrawalReasons.map(reason => [additionalInformationField(reason), z.string().optional()]),
) as Record<AdditionalInformationField, z.ZodOptional<z.ZodString>>

export const WithdrawalReasonSchema = z.object({
  withdrawalReason: z.enum(withdrawalReasons, { error: 'Select a reason for withdrawing the referral' }),
})

export const WithdrawalFormDataSchema = z
  .object({ ...WithdrawalReasonSchema.shape, ...additionalInformationFields })
  .superRefine((data, context) => {
    const field = additionalInformationField(data.withdrawalReason)
    const additionalInformation = data[field]?.trim()

    if (!additionalInformation) {
      context.addIssue({
        code: 'custom',
        message: 'Enter additional information about why the referral is being withdrawn',
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
  .transform(data => ({
    withdrawalReason: data.withdrawalReason,
    additionalInformation: data[additionalInformationField(data.withdrawalReason)]!.trim(),
  }))

export type WithdrawalFormData = z.infer<typeof WithdrawalFormDataSchema>

export const WithdrawalConfirmationSchema = z.object({
  confirmWithdrawal: z.enum(['yes', 'no'], { error: 'Select whether you want to withdraw the referral' }),
})
