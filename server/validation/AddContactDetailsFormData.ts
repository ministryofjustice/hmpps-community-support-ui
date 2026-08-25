import { z } from 'zod'

const MAX_CHAR = 65000
const phoneRegEx = /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/

const NAME_NOTHING_ENTERED_ERROR = { error: 'Enter a name' }
const NAME_TOO_LONG = { error: `Name must be ${MAX_CHAR} characters or less` }
const EMAIL_NOTHING_ENTERED_ERROR = { error: 'Enter an email address' }
const EMAIL_TOO_LONG = { error: `Email must be ${MAX_CHAR} characters or less` }
const EMAIL_INVALID = { error: `Enter an email address in the correct format, like name@example.com` }
const JOB_ROLE_TOO_LONG = { error: `Job role must be ${MAX_CHAR} characters or less` }
const PHONE_INVALID = { error: `Enter a phone number, like 01632 960 001, 07700 900 982 or +44 808 157 0192` }
const PHONE_TOO_LONG = { error: `Phone number must be ${MAX_CHAR} characters or less` }
const PDU_NOTHING_ENTERED_ERROR = { error: 'Enter a PDU' }
const TEAM_PHONE_INVALID = { error: `Enter a phone number, like 01632 960 001, 07700 900 982 or +44 808 157 0192` }
const TEAM_PHONE_TOO_LONG = { error: `Team phone number must be ${MAX_CHAR} characters or less` }

export const AddContactDetailsSchema = z.object({
  name: z.string().nonempty(NAME_NOTHING_ENTERED_ERROR).max(MAX_CHAR, NAME_TOO_LONG),
  email: z.string().nonempty(EMAIL_NOTHING_ENTERED_ERROR).max(MAX_CHAR, EMAIL_TOO_LONG).check(z.email(EMAIL_INVALID)),
  jobRole: z.string().max(MAX_CHAR, JOB_ROLE_TOO_LONG).optional(),
  phoneNumber: z
    .string()
    .max(MAX_CHAR, PHONE_TOO_LONG)
    .refine(val => !val || phoneRegEx.test(val), PHONE_INVALID)
    .optional(),
  pdu: z.string().nonempty(PDU_NOTHING_ENTERED_ERROR),
  teamPhoneNumber: z
    .string()
    .max(MAX_CHAR, TEAM_PHONE_TOO_LONG)
    .refine(val => !val || phoneRegEx.test(val), TEAM_PHONE_INVALID)
    .optional(),
})

type AddContactDetailsSchemaFormData = z.infer<typeof AddContactDetailsSchema>
export default AddContactDetailsSchemaFormData
