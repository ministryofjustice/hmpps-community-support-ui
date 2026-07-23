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
  return z
    .preprocess(
      val => (Array.isArray(val) ? val : [val]),
      z
        .array(z.enum(needsOptions, { error: emptySelectionErrorMessage }), { error: emptySelectionErrorMessage })
        .nonempty({ error: emptySelectionErrorMessage }),
    )
    .refine(arr => (arr.includes('none') ? arr.length === 1 : true), {
      error: emptySelectionErrorMessage,
      path: ['AdditionalNeeds'],
    })
}

export type Selection<T> = { selected: false } | { selected: true; value: T }

export const AdditionalSuportNeedsFormDataSchemaBuilder = (firstName: string) =>
  z
    .object({
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
    .transform(obj => ({
      Physical: obj.AdditionalNeeds.includes('Physical')
        ? ({ selected: true, value: obj.PhysicalValue } as Selection<string>)
        : ({ selected: false } as Selection<string>),
      Mental: obj.AdditionalNeeds.includes('Mental') ? { selected: true, value: obj.MentalValue } : { selected: false },
      Neurodiversity: obj.AdditionalNeeds.includes('Neurodiversity')
        ? ({ selected: true, value: obj.NeurodiversityValue } as Selection<string>)
        : ({ selected: false } as Selection<string>),
      Location: obj.AdditionalNeeds.includes('Location')
        ? ({ selected: true, value: obj.LocationValue } as Selection<string>)
        : ({ selected: false } as Selection<string>),
      Caring: obj.AdditionalNeeds.includes('Caring') ? { selected: true, value: obj.CaringValue } : { selected: false },
      Employment: obj.AdditionalNeeds.includes('Employment')
        ? ({ selected: true, value: obj.EmploymentValue } as Selection<string>)
        : ({ selected: false } as Selection<string>),
      Diversity: obj.AdditionalNeeds.includes('Diversity')
        ? ({ selected: true, value: obj.DiversityValue } as Selection<string>)
        : ({ selected: false } as Selection<string>),
      Anything: obj.AdditionalNeeds.includes('Anything')
        ? ({ selected: true, value: obj.AnythingValue } as Selection<string>)
        : ({ selected: false } as Selection<string>),
    }))
    .refine(({ Physical }) => !Physical.selected || (Physical.selected && Physical.value), {
      error: 'Enter details about the physical health issues',
      path: ['Physical'],
    })
    .refine(({ Mental }) => !Mental.selected || (Mental.selected && Mental.value), {
      error: 'Enter details about the mental or emotional health issues',
      path: ['Mental'],
    })
    .refine(({ Neurodiversity }) => !Neurodiversity.selected || (Neurodiversity.selected && Neurodiversity.value), {
      error: 'Enter details about the neurodiversity conditions',
      path: ['Neurodiversity'],
    })
    .refine(({ Location }) => !Location.selected || (Location.selected && Location.value), {
      error: 'Enter details about the location and travel issues',
      path: ['Location'],
    })
    .refine(({ Caring }) => !Caring.selected || (Caring.selected && Caring.value), {
      error: 'Enter details about the caring responsibilities',
      path: ['Caring'],
    })
    .refine(({ Employment }) => !Employment.selected || (Employment.selected && Employment.value), {
      error: 'Enter details about the employment responsibilities',
      path: ['Employment'],
    })
    .refine(({ Diversity }) => !Diversity.selected || (Diversity.selected && Diversity.value), {
      error: 'Enter details about the diversity',
      path: ['Diversity'],
    })
    .refine(({ Anything }) => !Anything.selected || (Anything.selected && Anything.value), {
      error: 'Enter details about any other support needs',
      path: ['Anything'],
    })

export interface AdditionalSuportNeedsFormData {
  Physical: Selection<string>
  Mental: Selection<string>
  Neurodiversity: Selection<string>
  Location: Selection<string>
  Caring: Selection<string>
  Employment: Selection<string>
  Diversity: Selection<string>
  Anything: Selection<string>
}
