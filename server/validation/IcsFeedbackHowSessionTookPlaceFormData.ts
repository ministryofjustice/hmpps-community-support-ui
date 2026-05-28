import { z } from 'zod'

const MAX = 100
const VALID_ADDRESS_CHAR = /^[a-zA-Z0-9\s\-']*$/
const VALID_POSTCODE = /^[a-zA-Z0-9\s]*$/

const SESSION_METHOD_MESSAGES: Record<string, string> = {
  PHONE: 'Select yes if the session took place by phone call',
  VIDEO: 'Select yes if the session took place by video call',
  IN_PERSON_PROBATION_OFFICE: 'Select yes if the session took place in person at this location',
  IN_PERSON_OTHER_LOCATION: 'Select yes if the session took place in person at this location',
}

export const phoneCallErrorMessage = (sessionMethodType: string): string =>
  SESSION_METHOD_MESSAGES[sessionMethodType] ?? 'Select yes if the session took place'

export const IcsFeedbackFormSchema = z
  .object({
    didSessionTakePlaceAsPlanned: z.string().trim().optional(),
    sessionMethodType: z.string(),
    phoneCall: z.string().trim().optional(),
    howSessionTookPlace: z.string().trim().optional(),
    phoneCallReason: z.string().trim().optional(),
    videoCallReason: z.string().trim().optional(),
    probationDeliveryUnit: z.string().trim().optional(),
    addressLine1: z.string().trim().optional(),
    addressLine2: z.string().trim().optional(),
    townOrCity: z.string().trim().optional(),
    county: z.string().trim().optional(),
    postcode: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.didSessionTakePlaceAsPlanned) {
      ctx.addIssue({
        code: 'custom',
        message: phoneCallErrorMessage(data.sessionMethodType),
        path: ['didSessionTakePlaceAsPlanned'],
      })
      return
    }
    if (data.didSessionTakePlaceAsPlanned !== 'no') return

    if (!data.howSessionTookPlace) {
      ctx.addIssue({
        code: 'custom',
        message: 'Select how the session took place',
        path: ['howSessionTookPlace'],
      })
      return
    }

    if (data.howSessionTookPlace === 'PHONE') {
      if (!data.phoneCallReason) {
        ctx.addIssue({
          code: 'custom',
          message: 'Enter why the session was not in person',
          path: ['phoneCallReason'],
        })
      }
      return
    }

    if (data.howSessionTookPlace === 'VIDEO') {
      if (!data.videoCallReason) {
        ctx.addIssue({
          code: 'custom',
          message: 'Enter why the session was not in person',
          path: ['videoCallReason'],
        })
      }
      return
    }

    if (data.howSessionTookPlace === 'IN_PERSON_PROBATION_OFFICE') {
      if (!data.probationDeliveryUnit) {
        ctx.addIssue({
          code: 'custom',
          message: 'Select a probation office',
          path: ['probationDeliveryUnit'],
        })
      }
      return
    }

    if (data.howSessionTookPlace === 'IN_PERSON_OTHER_LOCATION') {
      if (!data.addressLine1) {
        ctx.addIssue({
          code: 'custom',
          message: 'Enter an address line 1',
          path: ['addressLine1'],
        })
      } else if (data.addressLine1.length > MAX) {
        ctx.addIssue({
          code: 'custom',
          message: `Address line 1 must be ${MAX} characters or less`,
          path: ['addressLine1'],
        })
      } else if (!VALID_ADDRESS_CHAR.test(data.addressLine1)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Address line 1 must only include letters a to z, numbers 0 to 9, spaces, hyphens or apostrophes',
          path: ['addressLine1'],
        })
      }

      if (data.addressLine2) {
        if (data.addressLine2.length > MAX) {
          ctx.addIssue({
            code: 'custom',
            message: `Address line 2 must be ${MAX} characters or less`,
            path: ['addressLine2'],
          })
        } else if (!VALID_ADDRESS_CHAR.test(data.addressLine2)) {
          ctx.addIssue({
            code: 'custom',
            message: 'Address line 2 must only include letters a to z, numbers 0 to 9, spaces, hyphens or apostrophes',
            path: ['addressLine2'],
          })
        }
      }

      if (!data.townOrCity) {
        ctx.addIssue({
          code: 'custom',
          message: 'Enter a town or city',
          path: ['townOrCity'],
        })
      } else if (data.townOrCity.length > MAX) {
        ctx.addIssue({
          code: 'custom',
          message: `Town or city must be ${MAX} characters or less`,
          path: ['townOrCity'],
        })
      } else if (!VALID_ADDRESS_CHAR.test(data.townOrCity)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Town or city must only include letters a to z, numbers 0 to 9, spaces, hyphens or apostrophes',
          path: ['townOrCity'],
        })
      }

      if (data.county) {
        if (data.county.length > MAX) {
          ctx.addIssue({
            code: 'custom',
            message: `County must be ${MAX} characters or less`,
            path: ['county'],
          })
        } else if (!VALID_ADDRESS_CHAR.test(data.county)) {
          ctx.addIssue({
            code: 'custom',
            message: 'County must only include letters a to z, numbers 0 to 9, spaces, hyphens or apostrophes',
            path: ['county'],
          })
        }
      }

      if (!data.postcode) {
        ctx.addIssue({
          code: 'custom',
          message: 'Enter a postcode',
          path: ['postcode'],
        })
      } else if (data.postcode.length > MAX) {
        ctx.addIssue({
          code: 'custom',
          message: `Postcode must be ${MAX} characters or less`,
          path: ['postcode'],
        })
      } else if (!VALID_POSTCODE.test(data.postcode)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Postcode must only include letters a to z, numbers 0 to 9 or spaces',
          path: ['postcode'],
        })
      }
    }
  })

export type IcsFeedbackFormData = z.infer<typeof IcsFeedbackFormSchema>
