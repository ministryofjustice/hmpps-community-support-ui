import { z } from 'zod'

const MAX_CHAR = 3000

const checkIdentifyDetails = (val: { didYouIdentify: string; identifyDetails: string }) => {
  if (val.didYouIdentify === 'Yes') {
    return val.identifyDetails.length > 0
  }
  return true
}

const baseSchema = z.object({
  didYouIdentify: z.literal(['Yes', 'No'], {
    error: 'Select yes if you identified anything else they need support with',
  }),
  identifyDetails: z
    .string()
    .trim()
    .max(MAX_CHAR, `Details of additional support needs must be ${MAX_CHAR} characters or less`),
})
export const IdentifiedAdditionalNeedsFormDataSchema = baseSchema.refine(checkIdentifyDetails, {
  message: 'Enter details of anything else they need support with',
  path: ['identifyDetails'],
})

type IdentifiedAdditionalNeedsFormData = z.infer<typeof IdentifiedAdditionalNeedsFormDataSchema>
export default IdentifiedAdditionalNeedsFormData
