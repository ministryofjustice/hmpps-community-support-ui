import { z } from 'zod'
import { addDays, addMonths, isBefore, isAfter, startOfDay, isExists } from 'date-fns'
import { appointmentTypeRules, SessionAppointmentType } from '../appointment/appointmentTypeRules'

const validCharRegex: RegExp = /^[a-zA-Z0-9\s\-']*$/
const dateRegex: RegExp = /^$|^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
const hourRegex: RegExp = /^$|^(0?[1-9]|1[0-2])$/
const minuteRegex: RegExp = /^$|^(0?\d|[1-5]\d)$/
const postcodeRegex: RegExp = /^[a-zA-Z0-9\s]*$/
// UK postcode format, e.g. SW1A 1AA, M1 1AE, B33 8TH, CR2 6XH, DN55 1PT (space optional), plus GIR 0AA
const ukPostcodeRegex: RegExp = /^(GIR\s*0AA|[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})$/i
const POSTCODE_MAX_LENGTH = 100

const informedMethodItemSchema = z.enum(
  ['informedByPhone', 'informedByTextMessage', 'informedByEmail', 'informedByOtherMethod'],
  { error: 'Select how they were informed about the session' },
)

const informedMethodArraySchema = z.preprocess(
  val => {
    if (Array.isArray(val)) {
      return val
    }
    if (typeof val === 'string') {
      return [val]
    }
    return val
  },
  z
    .array(informedMethodItemSchema, { error: 'Select how they were informed about the session' })
    .min(1, { error: 'Select how they were informed about the session' })
    .max(4)
    .refine(arr => new Set(arr).size === arr.length, { message: 'Array must have unique values' }),
)

const informedMethodSchema = z
  .object({
    informedMethods: informedMethodArraySchema,
    otherMethodOfContact: z
      .string()
      .max(50, { error: 'Other method of contact must be 50 characters or less' })
      .regex(validCharRegex, {
        error:
          'Other method of contact must only include letters a to z, numbers 0 to 9, spaces, commas, hyphens or apostrophes',
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    const hasOther = data.informedMethods.includes('informedByOtherMethod')
    if (hasOther && !data.otherMethodOfContact) {
      ctx.addIssue({
        code: 'custom',
        path: ['otherMethodOfContact'],
        message: 'Enter other contact method',
      })
    }
  })

const getDate = (dateStr: string): Date | undefined => {
  if (!dateRegex.test(dateStr)) {
    return undefined
  }
  const [dayStr, monthStr, yearStr] = dateStr.split('/')
  const day = Number.parseInt(dayStr, 10)
  const month = Number.parseInt(monthStr, 10) - 1
  const year = Number.parseInt(yearStr, 10)
  return isExists(year, month, day) ? startOfDay(`${year}-${month + 1}-${day}`) : undefined
}

const buildDateSchema = (min: Date, max: Date) =>
  z
    .string()
    .nonempty({ error: 'Enter a session date' })
    .superRefine((data, ctx) => {
      if (data.length === 0) {
        return
      }
      const date = getDate(data)
      if (!date) {
        ctx.addIssue({
          code: 'custom',
          message: `Enter a date in the correct format, like 10/7/2025`,
          path: ['sessionDate'],
        })
        return
      }
      if (isBefore(date, min)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Session date must be after the referral date',
          path: ['sessionDate'],
        })
        return
      }
      if (isAfter(date, max)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Session date must not be more than 6 months in the future',
          path: ['sessionDate'],
        })
      }
    })

const hourSchema = z.string().regex(hourRegex, { error: 'Enter a real start time' })

const minuteSchema = z.string().regex(minuteRegex, { error: 'Enter a real start time' })

const meridiemSchema = z.enum(['am', 'AM', 'pm', 'PM', ''], { error: 'Select am or pm' })

const timeSchema = z
  .object({
    'sessionTime-hour': hourSchema,
    'sessionTime-minute': minuteSchema,
    'sessionTime-meridiem': meridiemSchema,
  })
  .superRefine((data, ctx) => {
    const hourEmpty = data['sessionTime-hour'] === ''
    const minuteEmpty = data['sessionTime-minute'] === ''
    const meridiemEmpty = data['sessionTime-meridiem'] === ''
    if (hourEmpty && minuteEmpty && meridiemEmpty) {
      ctx.addIssue({ code: 'custom', message: 'Enter a start time', path: ['sessionTime'] })
      return
    }
    if (hourEmpty) {
      ctx.addIssue({
        code: 'custom',
        message: 'Start time must include hours',
        path: ['sessionTime-hour'],
      })
    } else if (minuteEmpty) {
      ctx.addIssue({
        code: 'custom',
        message: 'Start time must include minutes',
        path: ['sessionTime-minute'],
      })
    }
    if (meridiemEmpty) {
      ctx.addIssue({
        code: 'custom',
        message: 'Select am or pm',
        path: ['sessionTime-meridiem'],
      })
    }
  })

const buildSessionDateSchema = (min: Date, max: Date) =>
  z.object({
    sessionDate: buildDateSchema(min, max),
  })

const whyIsThisSessionNotInPersonStringSchema = z
  .string()
  .nonempty({ error: 'Enter the reason the session is not in person' })
  .max(100, { error: 'Why is this session not in person must be 100 characters or less' })
  .regex(validCharRegex, {
    error:
      'Why is this session not in person must only include letters a to z, numbers 0 to 9, spaces, commas, hyphens or apostrophes',
  })

const byPhoneSchema = z.object({
  sessionTakePlace: z.literal('ByPhone'),
  ByPhone: whyIsThisSessionNotInPersonStringSchema,
})

const byVideoSchema = z.object({
  sessionTakePlace: z.literal('ByVideo'),
  ByVideo: whyIsThisSessionNotInPersonStringSchema,
})

const inProbationOfficeSchema = z.object({
  sessionTakePlace: z.literal('InProbationOffice'),
  probationOfficeList: z.string().nonempty({ error: 'Select a probation office' }),
})

const inSomewhereElseSchema = z.object({
  sessionTakePlace: z.literal('InSomewhereElse'),
  addressLine1: z
    .string()
    .nonempty({ error: 'Enter an address line 1' })
    .max(100, { error: 'Address line 1 must be 100 characters or less' })
    .regex(validCharRegex, {
      error: 'Address line 1 must only include letters a to z, numbers 0 to 9, spaces, hyphens or apostrophes',
    }),
  addressLine2: z.string().max(100, { error: 'Address line 2 must be 100 characters or less' }).regex(validCharRegex, {
    error: 'Address line 2 must only include letters a to z, numbers 0 to 9, spaces, hyphens or apostrophes',
  }),
  addressTown: z
    .string()
    .nonempty({ error: 'Enter a town or city' })
    .max(100, { error: 'Town or city must be 100 characters or less' })
    .regex(validCharRegex, {
      error: 'Town or city must only include letters a to z, numbers 0 to 9, spaces, hyphens or apostrophes',
    }),
  addressCounty: z.string().max(100, { error: 'County must be 100 characters or less' }).regex(validCharRegex, {
    error: 'County must only include letters a to z, numbers 0 to 9, spaces, hyphens or apostrophes',
  }),
  addressPostcode: z
    .string()
    .nonempty({ error: 'Enter a postcode' })
    .max(POSTCODE_MAX_LENGTH, { error: 'Postcode must be 100 characters or less' })
    .regex(postcodeRegex, { error: 'Postcode must only include letters a to z, numbers 0 to 9 or spaces' })
    .refine(
      postcode =>
        // only check the format once the checks above have passed, so the user sees a single error
        postcode.length === 0 ||
        postcode.length > POSTCODE_MAX_LENGTH ||
        !postcodeRegex.test(postcode) ||
        ukPostcodeRegex.test(postcode.trim()),
      { error: 'Enter a real postcode' },
    ),
})

const howSessionTookPlaceSchema = z.discriminatedUnion(
  'sessionTakePlace',
  [byPhoneSchema, byVideoSchema, inProbationOfficeSchema, inSomewhereElseSchema],
  { error: 'Select how the session will take place' },
)

const inPersonSchema = z.object({
  sessionTakePlace: z.literal('InPerson'),
})

const meetAtTheGateSchema = z.object({
  meetAtTheGate: z.enum(['yes', 'no'], { error: 'Select whether this is a meet at the gate session' }),
})

export const buildCreateAppointmentFormData = (referralDate: Date, appointmentType: SessionAppointmentType) => {
  const rules = appointmentTypeRules[appointmentType]
  const methodSchemas = [
    byVideoSchema,
    ...(rules.probationOffice ? [inProbationOfficeSchema] : []),
    ...(rules.somewhereElse ? [inSomewhereElseSchema] : []),
    ...(rules.inPerson ? [inPersonSchema] : []),
  ]
  const howSessionTookPlace = z.discriminatedUnion('sessionTakePlace', [byPhoneSchema, ...methodSchemas], {
    error: 'Select how the session will take place',
  })
  const minDate = appointmentType === 'CONTACT_SESSION' ? addDays(startOfDay(referralDate), 1) : referralDate
  const schema: z.ZodType = buildSessionDateSchema(minDate, addMonths(new Date(), 6))
    .and(timeSchema)
    .and(howSessionTookPlace)
  const withGate = rules.meetAtTheGate ? schema.and(meetAtTheGateSchema) : schema
  return rules.informed ? withGate.and(informedMethodSchema) : withGate
}

const buildScheduleIcsAppointmentFormData = (referralDate: Date) =>
  buildSessionDateSchema(referralDate, addMonths(new Date(), 6))
    .and(timeSchema)
    .and(howSessionTookPlaceSchema)
    .and(informedMethodSchema)
export default buildScheduleIcsAppointmentFormData
