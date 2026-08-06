import { z } from 'zod'

const NOTHING_SELECTED_ERROR = { error: 'You must select at least one need for this referral' }
const EMPTY_DETAILS = 'Enter details about the {{ name }} needs'

const formatError = (error: string, val: string): string => {
  return error.replace('{{ name }}', val)
}

export const PersonNeedsSchema = z
  .object({
    personNeedsCheckboxes: z.union([z.array(z.string()), z.string()], NOTHING_SELECTED_ERROR),
    accommodationInput: z.string(),
    employmentInput: z.string(),
    financesInput: z.string(),
    relationshipsInput: z.string(),
    drugUseInput: z.string(),
    alcoholUseInput: z.string(),
    healthInput: z.string(),
    thinkingInput: z.string(),
  })
  .superRefine((val, ctx) => {
    if (val.personNeedsCheckboxes.includes('accommodation') && !val.accommodationInput) {
      ctx.addIssue({
        code: 'custom',
        message: formatError(EMPTY_DETAILS, 'accommodation'),
        path: ['accommodationInput'],
      })
    }
    if (val.personNeedsCheckboxes.includes('employment and education') && !val.employmentInput) {
      ctx.addIssue({ code: 'custom', message: formatError(EMPTY_DETAILS, 'employment'), path: ['employmentInput'] })
    }
    if (val.personNeedsCheckboxes.includes('finances') && !val.financesInput) {
      ctx.addIssue({ code: 'custom', message: formatError(EMPTY_DETAILS, 'finances'), path: ['financesInput'] })
    }
    if (val.personNeedsCheckboxes.includes('personal relationships and community') && !val.relationshipsInput) {
      ctx.addIssue({
        code: 'custom',
        message: formatError(EMPTY_DETAILS, 'relationship'),
        path: ['relationshipsInput'],
      })
    }
    if (val.personNeedsCheckboxes.includes('drugUse') && !val.drugUseInput) {
      ctx.addIssue({ code: 'custom', message: formatError(EMPTY_DETAILS, 'drug use'), path: ['drugUseInput'] })
    }
    if (val.personNeedsCheckboxes.includes('alcoholUse') && !val.alcoholUseInput) {
      ctx.addIssue({ code: 'custom', message: formatError(EMPTY_DETAILS, 'alcohol use'), path: ['alcoholUseInput'] })
    }
    if (val.personNeedsCheckboxes.includes('health') && !val.healthInput) {
      ctx.addIssue({
        code: 'custom',
        message: formatError(EMPTY_DETAILS, 'health and wellbeing'),
        path: ['healthInput'],
      })
    }
    if (val.personNeedsCheckboxes.includes('thinking') && !val.thinkingInput) {
      ctx.addIssue({
        code: 'custom',
        message: formatError(EMPTY_DETAILS, 'thinking, behaviours and attitudes'),
        path: ['thinkingInput'],
      })
    }
  })

type PersonNeedsFormData = z.infer<typeof PersonNeedsSchema>
export default PersonNeedsFormData
