import { z } from 'zod'

const NOTHING_SELECTED_ERROR = { error: 'Select why the session did not happen' }
const SERVICE_PROVIDER_ISSUE_DETAILS_EMPTY_ERROR = {
  error: 'Give details of any issues that meant the session could not happen',
}
const REFERRAL_COULD_NOT_TAKE_PART_DETAILS_EMPTY_ERROR = {
  error: 'Give details about why they were unable to take part',
}
const REFERRAL_DID_NOT_COMPLY_DETAILS_EMPTY_ERROR = {
  error: 'Give details about their behaviour and how they were unable to take part',
}

export const WhyDidSessionNotHappenFormDataSchema = z.discriminatedUnion(
  'whyDidSessionNotHappen',
  [
    z.object({
      whyDidSessionNotHappen: z.literal('SERVICE_PROVIDER_ISSUE'),
      serviceProviderIssueDetails: z.string().min(1, SERVICE_PROVIDER_ISSUE_DETAILS_EMPTY_ERROR),
    }),
    z.object({
      whyDidSessionNotHappen: z.literal('REFERRAL_COULD_NOT_TAKE_PART'),
      referralCouldNotTakePartDetails: z.string().min(1, REFERRAL_COULD_NOT_TAKE_PART_DETAILS_EMPTY_ERROR),
    }),
    z.object({
      whyDidSessionNotHappen: z.literal('REFERRAL_DID_NOT_COMPLY'),
      referralDidNotComplyDetails: z.string().min(1, REFERRAL_DID_NOT_COMPLY_DETAILS_EMPTY_ERROR),
    }),
  ],
  NOTHING_SELECTED_ERROR,
)

type WhyDidSessionNotHappenFormData = z.infer<typeof WhyDidSessionNotHappenFormDataSchema>
export default WhyDidSessionNotHappenFormData
