import z from 'zod'

export const OffenceSentenceSchema = z
  .object({
    hasLicenceConditionsOrZones: z.enum(['No', 'Yes'], {
      error: 'Select yes if there are any licence conditions or exclusion zones the delivery partner should know about',
    }),
    licenceConditionsOrZonesDetails: z
      .string()
      .optional()
      .transform(value => value ?? ''),
  })
  .refine(
    ({ hasLicenceConditionsOrZones, licenceConditionsOrZonesDetails }) =>
      hasLicenceConditionsOrZones === 'No' || licenceConditionsOrZonesDetails.trim() !== '',
    {
      error: 'Enter details of all relevant licence conditions or exclusion zones',
      path: ['licenceConditionsOrZonesDetails'],
    },
  )
  .transform(({ hasLicenceConditionsOrZones, licenceConditionsOrZonesDetails }) => ({
    hasLicenceConditionsOrZones: hasLicenceConditionsOrZones === 'Yes',
    licenceConditionsOrZonesDetails:
      hasLicenceConditionsOrZones === 'Yes' ? licenceConditionsOrZonesDetails.trim() : null,
  }))

export type OffenceSentenceFormInput = z.input<typeof OffenceSentenceSchema>
export type OffenceSentenceFormData = z.infer<typeof OffenceSentenceSchema>
