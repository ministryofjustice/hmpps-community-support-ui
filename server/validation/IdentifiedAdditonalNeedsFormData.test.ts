import { IdentifiedAdditionalNeedsFormDataSchema } from './IdentifiedAdditonalNeedsFormData'

const MAX_CHAR = 3000

describe('IdentifiedAdditonalNeedsFormData', () => {
  test('happy path when additional needs were identified', () => {
    const formData = { didYouIdentify: 'Yes', identifyDetails: 'Test text' }
    const result = IdentifiedAdditionalNeedsFormDataSchema.safeParse(formData)
    expect(result.success).toBeTruthy()
    expect(result.error).toBeUndefined()
    expect(result.data).toEqual(formData)
  })

  test('happy path when no additional needs were identified', () => {
    const formData = { didYouIdentify: 'No', identifyDetails: '' }
    const result = IdentifiedAdditionalNeedsFormDataSchema.safeParse(formData)
    expect(result.success).toBeTruthy()
    expect(result.error).toBeUndefined()
  })

  test('details are trimmed', () => {
    const formData = { didYouIdentify: 'Yes', identifyDetails: '   Test text   ' }
    const result = IdentifiedAdditionalNeedsFormDataSchema.safeParse(formData)
    expect(result.success).toBeTruthy()
    expect(result.data.identifyDetails).toEqual('Test text')
  })

  test('empty details throws empty validation error when yes is selected', () => {
    const formData = { didYouIdentify: 'Yes', identifyDetails: '' }
    const result = IdentifiedAdditionalNeedsFormDataSchema.safeParse(formData)
    expect(result.success).toBeFalsy()
    expect(result.error).toBeDefined()
    expect(result.error.issues).toHaveLength(1)
    expect(result.error.issues.at(0).path).toContain('identifyDetails')
    expect(result.error.issues.at(0).message).toEqual('Enter details of anything else they need support with')
  })

  test('whitespace only details throws empty validation error when yes is selected', () => {
    const formData = { didYouIdentify: 'Yes', identifyDetails: '     ' }
    const result = IdentifiedAdditionalNeedsFormDataSchema.safeParse(formData)
    expect(result.success).toBeFalsy()
    expect(result.error).toBeDefined()
    expect(result.error.issues).toHaveLength(1)
    expect(result.error.issues.at(0).path).toContain('identifyDetails')
    expect(result.error.issues.at(0).message).toEqual('Enter details of anything else they need support with')
  })

  test('too big input throws max char validation error', () => {
    const formData = { didYouIdentify: 'Yes', identifyDetails: 'x'.repeat(MAX_CHAR + 1) }
    const result = IdentifiedAdditionalNeedsFormDataSchema.safeParse(formData)
    expect(result.success).toBeFalsy()
    expect(result.error).toBeDefined()
    expect(result.error.issues).toHaveLength(1)
    expect(result.error.issues.at(0).path).toContain('identifyDetails')
    expect(result.error.issues.at(0).message).toEqual(
      `Details of additional support needs must be ${MAX_CHAR} characters or less`,
    )
  })

  test("max char validation edge case doesn't throw error", () => {
    const formData = { didYouIdentify: 'Yes', identifyDetails: 'x'.repeat(MAX_CHAR) }
    const result = IdentifiedAdditionalNeedsFormDataSchema.safeParse(formData)
    expect(result.success).toBeTruthy()
    expect(result.error).toBeUndefined()
  })

  test('missing selection throws selection validation error', () => {
    const formData = { identifyDetails: '' }
    const result = IdentifiedAdditionalNeedsFormDataSchema.safeParse(formData)
    expect(result.success).toBeFalsy()
    expect(result.error).toBeDefined()
    expect(result.error.issues).toHaveLength(1)
    expect(result.error.issues.at(0).path).toContain('didYouIdentify')
    expect(result.error.issues.at(0).message).toEqual(
      'Select yes if you identified anything else they need support with',
    )
  })

  test('invalid selection throws selection validation error', () => {
    const formData = { didYouIdentify: 'Maybe', identifyDetails: '' }
    const result = IdentifiedAdditionalNeedsFormDataSchema.safeParse(formData)
    expect(result.success).toBeFalsy()
    expect(result.error).toBeDefined()
    expect(result.error.issues.at(0).path).toContain('didYouIdentify')
    expect(result.error.issues.at(0).message).toEqual(
      'Select yes if you identified anything else they need support with',
    )
  })
})
