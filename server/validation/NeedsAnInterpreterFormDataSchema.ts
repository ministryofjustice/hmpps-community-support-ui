import z from 'zod'

export const NeedsAnInterpreterFormDataSchemaBuilder = (name: string) =>
  z
    .object({
      language: z.string(),
      needsInterpreter: z.enum(['No', 'Yes'], { error: `Select yes if ${name} needs an interpreter` }),
    })
    .refine(
      ({ needsInterpreter, language }) => needsInterpreter === 'No' || (needsInterpreter === 'Yes' && language !== ''),
      { error: `Enter the language ${name} needs an interpreter for`, path: ['language'] },
    )
    .transform(({ needsInterpreter, language }) =>
      needsInterpreter === 'Yes' ? { needsInterpreter: true, language } : { needsInterpreter: false },
    )
export type NeedsAnInterpreterFormData = { needsInterpreter: true; language: string } | { needsInterpreter: false }
