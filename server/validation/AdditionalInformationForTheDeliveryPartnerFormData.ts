import z from 'zod'

export const AdditionalInformationForTheDeliveryPartnerFormDataSchema = z
  .object({
    details: z.string(),
    additionalInformation: z.enum(['No', 'Yes'], {
      error: `Select yes if there is anything else the delivery partner should know`,
    }),
  })
  .refine(
    ({ additionalInformation, details }) =>
      additionalInformation === 'No' || (additionalInformation === 'Yes' && details !== ''),
    { error: `Enter details of anything else the delivery partner should know`, path: ['details'] },
  )
  .transform(({ additionalInformation, details }) =>
    additionalInformation === 'Yes' ? { additionalInformation, details } : { additionalInformation },
  )
export type AdditionalInformationForTheDeliveryPartnerFormData =
  | { additionalInformation: 'Yes'; details: string }
  | { additionalInformation: 'No' }
