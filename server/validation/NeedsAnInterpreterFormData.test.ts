import { NeedsAnInterpreterFormDataSchemaBuilder } from './NeedsAnInterpreterFormDataSchema'

describe('NeedsAnInterpreterFormData', () => {
  const name = 'Alex' as const
  test('Nothing selected', () => {
    const input = {
      language: '',
      needsInterpreter: '',
    }
    const result = NeedsAnInterpreterFormDataSchemaBuilder(name).safeParse(input)
    expect(result.success).toBeFalsy()
    if (result.error) {
      expect(result.error.issues).toHaveLength(1)
      const error = result.error.issues.at(0)
      expect(error.path).toContain('needsInterpreter')
      expect(error.message).toBe(`Select yes if ${name} needs an interpreter`)
    }
  })
  test('No selected', () => {
    const input = {
      language: '',
      needsInterpreter: 'No',
    }
    const result = NeedsAnInterpreterFormDataSchemaBuilder(name).safeParse(input)
    expect(result).toStrictEqual({
      success: true,
      data: { needsInterpreter: false },
    })
  })
  test('Yes selected but no value given', () => {
    const input = {
      needsInterpreter: 'Yes',
      language: '',
    }
    const result = NeedsAnInterpreterFormDataSchemaBuilder(name).safeParse(input)
    expect(result.success).toBeFalsy()
    if (result.error) {
      expect(result.error.issues).toHaveLength(1)
      const error = result.error.issues.at(0)
      expect(error.path).toContain('language')
      expect(error.message).toBe(`Enter the language ${name} needs an interpreter for`)
    }
  })
  test('Yes selected and language given', () => {
    const input = {
      needsInterpreter: 'Yes',
      language: 'A Language',
    }
    const result = NeedsAnInterpreterFormDataSchemaBuilder(name).safeParse(input)
    expect(result).toStrictEqual({
      success: true,
      data: { needsInterpreter: true, language: 'A Language' },
    })
  })
})
