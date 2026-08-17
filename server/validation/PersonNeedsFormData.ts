import { z } from 'zod'

const MAX_CHAR = 65000

const NOTHING_SELECTED_ERROR = { error: 'You must select at least one need for this referral' }
const EMPTY_DETAILS = 'Enter details about the {{ name }} needs'
const TOO_MANY_CHAR = `Details about the {{ name }} needs must be ${MAX_CHAR} characters or less`

const formatError = (error: string, val: string): string => {
  return error.replace('{{ name }}', val)
}

export const PersonNeedsSchema = z
  .object({
    personNeedsCheckboxes: z.union([z.array(z.string()), z.string()], NOTHING_SELECTED_ERROR),
    accommodationInput: z.string().max(MAX_CHAR, formatError(TOO_MANY_CHAR, 'accommodation')),
    employmentInput: z.string().max(MAX_CHAR, formatError(TOO_MANY_CHAR, 'employment and education')),
    financesInput: z.string().max(MAX_CHAR, formatError(TOO_MANY_CHAR, 'finances')),
    relationshipsInput: z.string().max(MAX_CHAR, formatError(TOO_MANY_CHAR, 'personal relationships and community')),
    drugUseInput: z.string().max(MAX_CHAR, formatError(TOO_MANY_CHAR, 'drug use')),
    alcoholUseInput: z.string().max(MAX_CHAR, formatError(TOO_MANY_CHAR, 'alcohol use')),
    healthInput: z.string().max(MAX_CHAR, formatError(TOO_MANY_CHAR, 'health and wellbeing')),
    thinkingInput: z.string().max(MAX_CHAR, formatError(TOO_MANY_CHAR, 'thinking, behaviours and attitudes')),
  })
  .superRefine((val, ctx) => {
    if (val.personNeedsCheckboxes.includes('accommodation') && !val.accommodationInput) {
      ctx.addIssue({
        code: 'custom',
        message: formatError(EMPTY_DETAILS, 'accommodation'),
        path: ['accommodationInput'],
      })
    }
    if (val.personNeedsCheckboxes.includes('employment') && !val.employmentInput) {
      ctx.addIssue({
        code: 'custom',
        message: formatError(EMPTY_DETAILS, 'employment and education'),
        path: ['employmentInput'],
      })
    }
    if (val.personNeedsCheckboxes.includes('finances') && !val.financesInput) {
      ctx.addIssue({ code: 'custom', message: formatError(EMPTY_DETAILS, 'finances'), path: ['financesInput'] })
    }
    if (val.personNeedsCheckboxes.includes('relationships') && !val.relationshipsInput) {
      ctx.addIssue({
        code: 'custom',
        message: formatError(EMPTY_DETAILS, 'personal relationships and community'),
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
