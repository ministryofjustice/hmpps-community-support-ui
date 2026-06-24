import { RefinementCtx, z } from 'zod'
import { addMonths, format } from 'date-fns'

const isPersonInCommunity = (id: string): boolean => {
  if (!id) return false
  return id.length === 7 && /^[A-Z]\d{6}$/.test(id.toUpperCase())
}

const isValidAddressChar = (str: string): boolean => {
  return /^[a-zA-Z0-9\s\-']*$/.test(str)
}

const buildDateSchema =
  (min: Date = null, max: Date = null) =>
  (data: ScheduleIcsAppointmentFormData, ctx: RefinementCtx) => {
    const { sessionDate } = data
    if (!sessionDate) {
      ctx.addIssue({ code: 'custom', message: 'Enter the date of the session', path: ['sessionDate'] })
      return
    }
    const dateString = sessionDate
      .split('/')
      .reverse()
      .map(v => v.padStart(2, '0'))
      .join('-')
    const valid = z.iso.date().safeParse(dateString)
    if (!valid.success) {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter a date in the correct format, like 10/7/2025',
        path: ['sessionDate'],
      })
      return
    }
    if (min) {
      const minDate = z.coerce.date().min(new Date(min)).safeParse(dateString)
      if (!minDate.success) {
        ctx.addIssue({
          code: 'custom',
          message: `The session date must be after the referral date, ${format(new Date(min), 'd/M/yyyy')}`,
          path: ['sessionDate'],
        })
        return
      }
    }
    if (max) {
      const maxDate = z.coerce.date().max(new Date(max)).safeParse(dateString)
      if (!maxDate.success) {
        ctx.addIssue({
          code: 'custom',
          message: `The session date must be before ${format(new Date(max), 'd/M/yyyy')}`,
          path: ['sessionDate'],
        })
      }
    }
  }

const validateTime = (data: ScheduleIcsAppointmentFormData, ctx: RefinementCtx) => {
  const { 'sessionTime-hour': hour, 'sessionTime-minute': minute, 'sessionTime-meridiem': meridiem } = data
  if (!hour && !minute && !meridiem) {
    ctx.addIssue({ code: 'custom', message: 'Enter the start time of the session', path: ['sessionTime'] })
    return
  }
  if (!hour) {
    ctx.addIssue({
      code: 'custom',
      message: 'Session start time must include an hour and minute ',
      path: ['sessionTime-hour'],
    })
  }
  if (!minute) {
    ctx.addIssue({
      code: 'custom',
      message: 'Session start time must include an hour and minute ',
      path: ['sessionTime-minute'],
    })
  }
  if (!meridiem) {
    ctx.addIssue({
      code: 'custom',
      message: 'Select whether the session start time is AM or PM',
      path: ['sessionTime-meridiem'],
    })
  }
  const hourValidation = z.coerce.number().int().gt(0).lte(12).safeParse(hour)
  const minuteValidation = z.coerce.number().int().gte(0).lt(60).safeParse(minute)
  const meridiemValidation = z.literal(['AM', 'PM']).safeParse(meridiem.toUpperCase())
  if (!hourValidation.success || !minuteValidation.success || !meridiemValidation.success) {
    ctx.addIssue({ code: 'custom', message: 'Enter a session start time in the correct format', path: ['sessionTime'] })
  }
}

const validateSessionTakePlace = (data: ScheduleIcsAppointmentFormData, ctx: RefinementCtx) => {
  const {
    referralCrn,
    sessionTakePlace,
    ByPhone,
    ByVideo,
    probationOfficeList,
    addressLine1,
    addressLine2,
    addressTown,
    addressCounty,
    addressPostcode,
    prisonList,
  } = data
  if (!sessionTakePlace) {
    ctx.addIssue({ code: 'custom', message: 'Select how the session will take place', path: ['sessionTakePlace'] })
  }
  switch (sessionTakePlace) {
    case 'ByPhone':
      if (!ByPhone) {
        ctx.addIssue({ code: 'custom', message: 'Enter why the session is not in person', path: ['ByPhone'] })
        break
      }
      if (ByPhone.length > 100) {
        ctx.addIssue({
          code: 'custom',
          message: 'Why is this session not in person must be 100 characters or less',
          path: ['ByPhone'],
        })
      }
      break
    case 'ByVideo':
      if (!ByVideo) {
        ctx.addIssue({ code: 'custom', message: 'Enter why the session is not in person', path: ['ByVideo'] })
        break
      }
      if (ByVideo.length > 100) {
        ctx.addIssue({
          code: 'custom',
          message: 'Why is this session not in person must be 100 characters or less',
          path: ['ByVideo'],
        })
      }
      break
    case 'InProbationOffice':
      if (!isPersonInCommunity(referralCrn)) break
      if (!probationOfficeList) {
        ctx.addIssue({ code: 'custom', message: 'Select probation office', path: ['probationOfficeList'] })
      }
      break
    case 'InSomewhereElse':
      if (!isPersonInCommunity(referralCrn)) break
      if (!addressLine1) {
        ctx.addIssue({ code: 'custom', message: 'Enter an address line 1', path: ['addressLine1'] })
      } else if (addressLine1.length > 100) {
        ctx.addIssue({
          code: 'custom',
          message: 'Address line 1 must be 100 characters or less',
          path: ['addressLine1'],
        })
      } else if (!isValidAddressChar(addressLine1)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Address line 1 must only include letters a to z, numbers 0 to 9, spaces, hyphens or apostrophes',
          path: ['addressLine1'],
        })
      }
      if (addressLine2 && addressLine2.length > 100) {
        ctx.addIssue({
          code: 'custom',
          message: 'Address line 2 must be 100 characters or less',
          path: ['addressLine2'],
        })
      } else if (!isValidAddressChar(addressLine2)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Address line 2 must only include letters a to z, numbers 0 to 9, spaces, hyphens or apostrophes',
          path: ['addressLine2'],
        })
      }
      if (!addressTown) {
        ctx.addIssue({ code: 'custom', message: 'Enter a town or city', path: ['addressTown'] })
      } else if (addressTown.length > 100) {
        ctx.addIssue({ code: 'custom', message: 'Town or city must be 100 characters or less', path: ['addressTown'] })
      } else if (!isValidAddressChar(addressTown)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Town or city must only include letters a to z, numbers 0 to 9, spaces, hyphens or apostrophes',
          path: ['addressTown'],
        })
      }
      if (addressCounty && addressCounty.length > 100) {
        ctx.addIssue({ code: 'custom', message: 'County must be 100 characters or less', path: ['addressCounty'] })
      } else if (!isValidAddressChar(addressCounty)) {
        ctx.addIssue({
          code: 'custom',
          message: 'County must only include letters a to z, numbers 0 to 9, spaces, hyphens or apostrophes',
          path: ['addressCounty'],
        })
      }
      if (!addressPostcode) {
        ctx.addIssue({ code: 'custom', message: 'Enter a postcode', path: ['addressPostcode'] })
      } else if (addressPostcode.length > 100) {
        ctx.addIssue({ code: 'custom', message: 'Postcode must be 100 characters or less', path: ['addressPostcode'] })
      } else if (!/^[a-zA-Z0-9\s]*$/.test(addressPostcode)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Postcode must only include letters a to z, numbers 0 to 9 or spaces',
          path: ['addressPostcode'],
        })
      }
      break
    case 'InPrison':
      if (!prisonList) {
        ctx.addIssue({ code: 'custom', message: 'Select prison', path: ['prisonList'] })
      }
      break
    default:
      break
  }
}

const validateInformedMethod = (data: ScheduleIcsAppointmentFormData, ctx: RefinementCtx) => {
  const { referralCrn, otherMethodOfContact } = data
  let { informedMethod } = data
  if (!isPersonInCommunity(referralCrn)) return
  if (typeof informedMethod === 'string') {
    informedMethod = [informedMethod]
  }
  if (!informedMethod || informedMethod.length === 0) {
    ctx.addIssue({
      code: 'custom',
      message: 'Select how {{ firstname }} was informed about the session',
      path: ['informedMethod'],
    })
  } else if (informedMethod.includes('informedByOtherMethod')) {
    if (!otherMethodOfContact) {
      ctx.addIssue({ code: 'custom', message: 'Enter the other method of contact', path: ['otherMethodOfContact'] })
    } else if (otherMethodOfContact.length > 50) {
      ctx.addIssue({
        code: 'custom',
        message: 'Other method of contact must be 50 characters or less',
        path: ['otherMethodOfContact'],
      })
    } else if (!/^[a-zA-Z0-9\s,\-']*$/.test(otherMethodOfContact)) {
      ctx.addIssue({
        code: 'custom',
        message:
          'Other method of contact must only include letters a to z, numbers 0 to 9, spaces, commas, hyphens or apostrophes',
        path: ['otherMethodOfContact'],
      })
    }
  }
}

const validateForm = (referralDate: Date) => (data: ScheduleIcsAppointmentFormData, ctx: RefinementCtx) => {
  buildDateSchema(referralDate, addMonths(new Date(), 6))(data, ctx)
  validateTime(data, ctx)
  validateSessionTakePlace(data, ctx)
  validateInformedMethod(data, ctx)
}

const baseSchema = z.object({
  referralCrn: z.string().trim().optional(),
  sessionDate: z.string().trim().optional(),
  'sessionTime-hour': z.string().trim().optional(),
  'sessionTime-minute': z.string().trim().optional(),
  'sessionTime-meridiem': z.string().trim().optional(),
  sessionTakePlace: z.string().trim().optional(),
  ByPhone: z.string().trim().optional(),
  ByVideo: z.string().trim().optional(),
  probationOfficeList: z.string().trim().optional(),
  addressLine1: z.string().trim().optional(),
  addressLine2: z.string().trim().optional(),
  addressTown: z.string().trim().optional(),
  addressCounty: z.string().trim().optional(),
  addressPostcode: z.string().trim().optional(),
  informedMethod: z.union([z.string().trim(), z.array(z.string().trim())]).optional(),
  otherMethodOfContact: z.string().trim().optional(),
  prisonList: z.string().trim().optional(),
})

export const buildScheduleIcsAppointmentSchema = (referralDate: Date) =>
  baseSchema.superRefine(validateForm(referralDate))

export type ScheduleIcsAppointmentFormData = z.infer<typeof baseSchema>
