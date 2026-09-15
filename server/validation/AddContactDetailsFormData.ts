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
const PDU_INVALID_ERROR = { error: 'Select a PDU from the list' }
const PROBATION_OFFICE_INVALID_ERROR = { error: 'Select a probation office from the list' }
const TEAM_PHONE_INVALID = { error: `Enter a phone number, like 01632 960 001, 07700 900 982 or +44 808 157 0192` }
const TEAM_PHONE_TOO_LONG = { error: `Team phone number must be ${MAX_CHAR} characters or less` }

type SelectOption = { id: string | number; name: string }

// The pdu/probationOffice select values are submitted as JSON-encoded strings (see
// AddContactDetailsPresenter.generateSelectArgs). Parse so that malformed
// JSON (e.g. "{}") is picked up as a validation error rather than throwing.
const parseSelectOption = (val: string): SelectOption | null => {
  let parsed: unknown
  try {
    parsed = JSON.parse(val)
  } catch {
    return null
  }
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !('id' in parsed) ||
    !('name' in parsed) ||
    (typeof (parsed as SelectOption).id !== 'string' && typeof (parsed as SelectOption).id !== 'number') ||
    (parsed as SelectOption).id === '' ||
    typeof (parsed as SelectOption).name !== 'string' ||
    (parsed as SelectOption).name === ''
  ) {
    return null
  }
  return parsed as SelectOption
}

export const AddContactDetailsSchemaBuilder = (
  validPduIds: ReadonlyArray<string | number> = [],
  validProbationOfficeIds: ReadonlyArray<string | number> = [],
) =>
  z.object({
    name: z.string().nonempty(NAME_NOTHING_ENTERED_ERROR).max(MAX_CHAR, NAME_TOO_LONG),
    emailAddress: z
      .string()
      .nonempty(EMAIL_NOTHING_ENTERED_ERROR)
      .max(MAX_CHAR, EMAIL_TOO_LONG)
      .check(z.email(EMAIL_INVALID)),
    jobRole: z.string().max(MAX_CHAR, JOB_ROLE_TOO_LONG).optional(),
    phoneNumber: z
      .string()
      .max(MAX_CHAR, PHONE_TOO_LONG)
      .refine(val => !val || phoneRegEx.test(val), PHONE_INVALID)
      .optional(),
    pdu: z
      .string()
      .nonempty(PDU_NOTHING_ENTERED_ERROR)
      .refine(val => parseSelectOption(val) !== null, PDU_INVALID_ERROR)
      .refine(val => validPduIds.length === 0 || validPduIds.includes(parseSelectOption(val)!.id), PDU_INVALID_ERROR),
    probationOffice: z
      .string()
      .optional()
      .refine(val => !val || parseSelectOption(val) !== null, PROBATION_OFFICE_INVALID_ERROR)
      .refine(
        val =>
          !val || validProbationOfficeIds.length === 0 || validProbationOfficeIds.includes(parseSelectOption(val)!.id),
        PROBATION_OFFICE_INVALID_ERROR,
      ),
    teamPhoneNumber: z
      .string()
      .max(MAX_CHAR, TEAM_PHONE_TOO_LONG)
      .refine(val => !val || phoneRegEx.test(val), TEAM_PHONE_INVALID)
      .optional(),
  })

export const AddContactDetailsSchema = AddContactDetailsSchemaBuilder()

type AddContactDetailsSchemaFormData = z.infer<typeof AddContactDetailsSchema>
export default AddContactDetailsSchemaFormData
