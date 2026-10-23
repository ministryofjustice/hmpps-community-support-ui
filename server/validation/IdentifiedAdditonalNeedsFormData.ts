import { z } from 'zod'

const checkIdentityDetails = (val: { didYouIdentity: string; identityDetails: string }) => {
  if (val.didYouIdentity === 'Yes') {
    return val.identityDetails.length > 0
  }
  return true
}

const baseSchema = z.object({
  didYouIdentity: z.literal(['Yes', 'No'], {
    error: 'Select yes if you identity anything else {{ firstname }} needs support with',
  }),
  identityDetails: z.string(),
})
export const IdentifiedAdditionalNeedsFormDataSchema = baseSchema.refine(checkIdentityDetails, {
  message: 'Enter details of anything else {{ firstname }} needs support with',
  path: ['identityDetails'],
})

type IdentifiedAdditionalNeedsFormData = z.infer<typeof IdentifiedAdditionalNeedsFormDataSchema>
export default IdentifiedAdditionalNeedsFormData
