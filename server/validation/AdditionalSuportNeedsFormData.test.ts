import { $ZodIssue } from 'zod/v4/core'
import {
  AdditionalSuportNeedsFormData,
  AdditionalSuportNeedsFormDataSchemaBuilder,
} from './AdditionalSuportNeedsFormData'

const firstName = 'Alex' as const
const someText = 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem' as const

interface FormData {
  PhysicalValue: string
  MentalValue: string
  NeurodiversityValue: string
  LocationValue: string
  CaringValue: string
  EmploymentValue: string
  DiversityValue: string
  AnythingValue: string
  AdditionalNeeds?: string | string[]
}

const checkError = (error: $ZodIssue, path: string[], message: string) => {
  expect(error.path).toStrictEqual(path)
  expect(error.message).toBe(message)
}

describe('AdditionalSuportNeedsFormData2', () => {
  const emptyFormData: FormData = {
    PhysicalValue: '',
    MentalValue: '',
    NeurodiversityValue: '',
    LocationValue: '',
    CaringValue: '',
    EmploymentValue: '',
    DiversityValue: '',
    AnythingValue: '',
  }
  const fullFormData: FormData = {
    PhysicalValue: someText,
    MentalValue: someText,
    NeurodiversityValue: someText,
    LocationValue: someText,
    CaringValue: someText,
    EmploymentValue: someText,
    DiversityValue: someText,
    AnythingValue: someText,
  }
  const noneSelectedExpected: AdditionalSuportNeedsFormData = {
    ...emptyFormData,
    AdditionalNeeds: ['none'],
  }
  test('nothing selected missing selection field', () => {
    const formData = emptyFormData
    const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
    expect(result.success).toBeFalsy()
    expect(result.error).toBeDefined()
    if (result.error) {
      expect(result.error.issues).toHaveLength(1)
      const error = result.error.issues.at(0)
      expect(error.path).toContain('AdditionalNeeds')
      expect(error.message).toBe(
        `Select what ${firstName} needs support with or select ${firstName} does not need any additional support`,
      )
    }
  })
  test('nothing selected - empty array', () => {
    const selection: string[] = []
    const formData: FormData = { ...emptyFormData, AdditionalNeeds: selection }
    const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
    expect(result.success).toBeFalsy()
    expect(result.error).toBeDefined()
    if (result.error) {
      expect(result.error.issues).toHaveLength(1)
      const error = result.error.issues.at(0)
      expect(error.path).toContain('AdditionalNeeds')
      expect(error.message).toBe(
        `Select what ${firstName} needs support with or select ${firstName} does not need any additional support`,
      )
    }
  })
  test('nothing selected - empty string in array', () => {
    const selection: string[] = ['']
    const formData: FormData = { ...emptyFormData, AdditionalNeeds: selection }
    const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
    expect(result.success).toBeFalsy()
    expect(result.error).toBeDefined()
    if (result.error) {
      expect(result.error.issues).toHaveLength(1)
      const error = result.error.issues.at(0)
      expect(error.path).toContain('AdditionalNeeds')
      expect(error.message).toBe(
        `Select what ${firstName} needs support with or select ${firstName} does not need any additional support`,
      )
    }
  })
  test('does not need any additional support selected', () => {
    const selection: string[] = ['none']
    const formData: FormData = { ...emptyFormData, AdditionalNeeds: selection }
    const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
    expect(result.success).toBeTruthy()
    expect(result.data).toStrictEqual(noneSelectedExpected)
  })
  test('does not need any additional support selected with values', () => {
    const selection: string[] = ['none']
    const formData: FormData = { ...fullFormData, AdditionalNeeds: selection }
    const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
    expect(result.success).toBeTruthy()
    expect(result.data).toStrictEqual(noneSelectedExpected)
  })
  test('nothing selected and something else', () => {
    const selection: string[] = ['none', 'Physical']
    const formData: FormData = { ...emptyFormData, AdditionalNeeds: selection }
    const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
    expect(result.success).toBeFalsy()
    expect(result.error).toBeDefined()
    if (result.error) {
      expect(result.error.issues).toHaveLength(1)
      const error = result.error.issues.at(0)
      expect(error.path).toContain('AdditionalNeeds')
      expect(error.message).toBe(
        `Select what ${firstName} needs support with or select ${firstName} does not need any additional support`,
      )
    }
  })
  test('with values', () => {
    const formData: FormData = {
      ...fullFormData,
      AdditionalNeeds: [
        'Physical',
        'Mental',
        'Neurodiversity',
        'Location',
        'Caring',
        'Employment',
        'Diversity',
        'Anything',
      ],
    }
    const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
    expect(result.success).toBeTruthy()
    expect(result.data).toStrictEqual({
      ...fullFormData,
      AdditionalNeeds: [
        'Physical',
        'Mental',
        'Neurodiversity',
        'Location',
        'Caring',
        'Employment',
        'Diversity',
        'Anything',
      ],
    })
  })
  test('with values one selected', () => {
    const formData: FormData = {
      ...fullFormData,
      AdditionalNeeds: ['Location'],
    }
    const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
    expect(result.success).toBeTruthy()
    expect(result.data).toStrictEqual({
      ...noneSelectedExpected,
      LocationValue: someText,
      AdditionalNeeds: ['Location'],
    })
  })
  test('without values', () => {
    const formData: FormData = {
      ...emptyFormData,
      AdditionalNeeds: [
        'Physical',
        'Mental',
        'Neurodiversity',
        'Location',
        'Caring',
        'Employment',
        'Diversity',
        'Anything',
      ],
    }
    const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
    expect(result.success).toBeFalsy()
    if (result.error) {
      expect(result.error.issues).toHaveLength(8)
      checkError(result.error.issues.at(0), ['PhysicalValue'], 'Enter details about the physical health issues')
      checkError(
        result.error.issues.at(1),
        ['MentalValue'],
        'Enter details about the mental or emotional health issues',
      )
      checkError(
        result.error.issues.at(2),
        ['NeurodiversityValue'],
        'Enter details about the neurodiversity conditions',
      )
      checkError(result.error.issues.at(3), ['LocationValue'], 'Enter details about the location and travel issues')
      checkError(result.error.issues.at(4), ['CaringValue'], 'Enter details about the caring responsibilities')
      checkError(result.error.issues.at(5), ['EmploymentValue'], 'Enter details about the employment responsibilities')
      checkError(result.error.issues.at(6), ['DiversityValue'], 'Enter details about the diversity')
      checkError(result.error.issues.at(7), ['AnythingValue'], 'Enter details about any other support needs')
    }
  })
  test('Physical selected but no value', () => {
    const formData: FormData = { ...emptyFormData, AdditionalNeeds: 'Physical' }
    const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
    expect(result.success).toBeFalsy()
    expect(result.error).toBeDefined()
    if (result.error) {
      expect(result.error.issues).toHaveLength(1)
      checkError(result.error.issues.at(0), ['PhysicalValue'], 'Enter details about the physical health issues')
    }
  })
  test('selected but no value', () => {
    const formData: FormData = {
      ...emptyFormData,
      AdditionalNeeds: 'Anything',
    }
    const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
    expect(result.success).toBeFalsy()
    expect(result.error).toBeDefined()
    if (result.error) {
      expect(result.error.issues).toHaveLength(1)
      checkError(result.error.issues.at(0), ['AnythingValue'], 'Enter details about any other support needs')
    }
  })
  test('value but not selected', () => {
    const formData: FormData = {
      ...emptyFormData,
      PhysicalValue: someText,
      AnythingValue: someText,
      AdditionalNeeds: 'Anything',
    }
    const result = AdditionalSuportNeedsFormDataSchemaBuilder(firstName).safeParse(formData)
    expect(result.success).toBeTruthy()
    expect(result.data).toStrictEqual({
      ...emptyFormData,
      AnythingValue: someText,
      AdditionalNeeds: ['Anything'],
    })
  })
})
