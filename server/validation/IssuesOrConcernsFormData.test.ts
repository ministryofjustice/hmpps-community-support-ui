import { IssuesOrConcernsFormDataSchema } from './IssuesOrConcernsFormData'

const MAX_CHAR = 3000

describe('IssuesOrConcernsFormData', () => {
  test('happy path', () => {
    const formData = { issuesOrConcerns: 'Test text' }
    const result = IssuesOrConcernsFormDataSchema.safeParse(formData)
    expect(result.success).toBeTruthy()
    expect(result.error).toBeUndefined()
  })

  test('empty input throws empty validation error', () => {
    const formData = { issuesOrConcerns: '' }
    const result = IssuesOrConcernsFormDataSchema.safeParse(formData)
    expect(result.success).toBeFalsy()
    expect(result.error).toBeDefined()
    expect(result.error.issues).toHaveLength(1)
    expect(result.error.issues.at(0).path).toContain('issuesOrConcerns')
    expect(result.error.issues.at(0).message).toEqual('Enter any issues or concerns you identified')
  })

  test('too big input throws max char validation error', () => {
    const formData = { issuesOrConcerns: 'x'.repeat(MAX_CHAR + 1) }
    const result = IssuesOrConcernsFormDataSchema.safeParse(formData)
    expect(result.success).toBeFalsy()
    expect(result.error).toBeDefined()
    expect(result.error.issues).toHaveLength(1)
    expect(result.error.issues.at(0).path).toContain('issuesOrConcerns')
    expect(result.error.issues.at(0).message).toEqual(`Details of issues or concerns must be ${MAX_CHAR} characters or less`)
  })

  test("max char validation edge case doesn't throw error", () => {
    const formData = { issuesOrConcerns: 'x'.repeat(MAX_CHAR) }
    const result = IssuesOrConcernsFormDataSchema.safeParse(formData)
    expect(result.success).toBeTruthy()
    expect(result.error).toBeUndefined()
  })
})
