import z from 'zod'
import validString from './ValidString'

export const AdditionalInformationForTheDeliveryPartnerFormDataSchema = z
  .object({
    details: validString('Details of anything else the delivery partner should know must be 65000 characters or less'),
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
