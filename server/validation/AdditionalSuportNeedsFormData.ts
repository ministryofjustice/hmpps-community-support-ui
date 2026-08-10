import z from 'zod'

const needsOptions = [
  'Physical',
  'Mental',
  'Neurodiversity',
  'Location',
  'Caring',
  'Employment',
  'Diversity',
  'Anything',
  'none',
] as const

const SelectionSchemaBuilder = (firstName: string) => {
  const emptySelectionErrorMessage = `Select what ${firstName} needs support with or select ${firstName} does not need any additional support`
  return z.nonoptional(
    z
      .preprocess(
        val => (Array.isArray(val) ? val : [val]),
        z
          .array(z.enum(needsOptions, { error: emptySelectionErrorMessage }), { error: emptySelectionErrorMessage })
          .nonempty({ error: emptySelectionErrorMessage }),
      )
      .refine(arr => (arr.includes('none') ? arr.length === 1 : true), {
        error: emptySelectionErrorMessage,
        path: ['AdditionalNeeds'],
      }),
  )
}

const errorMessageLookup: Record<string, string> = {
  Physical: 'Enter details about the physical health issues',
  Mental: 'Enter details about the mental or emotional health issues',
  Neurodiversity: 'Enter details about the neurodiversity conditions',
  Location: 'Enter details about the location and travel issues',
  Caring: 'Enter details about the caring responsibilities',
  Employment: 'Enter details about the employment responsibilities',
  Diversity: 'Enter details about the diversity',
  Anything: 'Enter details about any other support needs',
}

export const rawFormDataBuilder = (firstName: string) =>
  z.object({
    AdditionalNeeds: SelectionSchemaBuilder(firstName),
    PhysicalValue: z.string(),
    MentalValue: z.string(),
    NeurodiversityValue: z.string(),
    LocationValue: z.string(),
    CaringValue: z.string(),
    EmploymentValue: z.string(),
    DiversityValue: z.string(),
    AnythingValue: z.string(),
  })

export type AdditionalNeedsType =
  | 'Physical'
  | 'Mental'
  | 'Neurodiversity'
  | 'Location'
  | 'Caring'
  | 'Employment'
  | 'Diversity'
  | 'Anything'
  | 'none'

export interface AdditionalSuportNeedsFormData {
  AdditionalNeeds: AdditionalNeedsType[]
  PhysicalValue: string
  MentalValue: string
  NeurodiversityValue: string
  LocationValue: string
  CaringValue: string
  EmploymentValue: string
  DiversityValue: string
  AnythingValue: string
}

const removeUnselectedValues = (formData: AdditionalSuportNeedsFormData): AdditionalSuportNeedsFormData => ({
  AdditionalNeeds: formData.AdditionalNeeds,
  PhysicalValue: formData.AdditionalNeeds.includes('Physical') ? formData.PhysicalValue : '',
  MentalValue: formData.AdditionalNeeds.includes('Mental') ? formData.MentalValue : '',
  NeurodiversityValue: formData.AdditionalNeeds.includes('Neurodiversity') ? formData.NeurodiversityValue : '',
  LocationValue: formData.AdditionalNeeds.includes('Location') ? formData.LocationValue : '',
  CaringValue: formData.AdditionalNeeds.includes('Caring') ? formData.CaringValue : '',
  EmploymentValue: formData.AdditionalNeeds.includes('Employment') ? formData.EmploymentValue : '',
  DiversityValue: formData.AdditionalNeeds.includes('Diversity') ? formData.DiversityValue : '',
  AnythingValue: formData.AdditionalNeeds.includes('Anything') ? formData.AnythingValue : '',
})

export const AdditionalSuportNeedsFormDataSchemaBuilder = (firstName: string) =>
  rawFormDataBuilder(firstName)
    .transform(removeUnselectedValues)
    .superRefine((data, context) =>
      data.AdditionalNeeds.filter(selection => selection !== 'none').forEach(selection => {
        const value = data[`${selection}Value`]
        if (value.trim() === '') {
          context.addIssue({
            code: 'custom',
            message: errorMessageLookup[selection] ?? 'Invalid field',
            path: [`${selection}Value`],
          })
        }
      }),
    )
