import { IssuesOrConcernsFormDataSchema } from './IssuesOrConcernsFormData'

const MAX_CHAR = 3000

describe('IssuesOrConcernsFormData', () => {
  test('happy path', () => {
    const formData = { issuesOrConcerns: 'Test text', notifyProbationPractitioner: 'Yes' }
    const result = IssuesOrConcernsFormDataSchema.safeParse(formData)
    expect(result.success).toBeTruthy()
    expect(result.error).toBeUndefined()
  })

  test.each(['Yes', 'No'])('accepts a %s notification selection', notifyProbationPractitioner => {
    const result = IssuesOrConcernsFormDataSchema.safeParse({
      issuesOrConcerns: 'Test text',
      notifyProbationPractitioner,
    })
    expect(result.success).toBeTruthy()
  })

  test('empty input throws empty validation error', () => {
    const formData = { issuesOrConcerns: '', notifyProbationPractitioner: 'Yes' }
    const result = IssuesOrConcernsFormDataSchema.safeParse(formData)
    expect(result.success).toBeFalsy()
    expect(result.error).toBeDefined()
    expect(result.error.issues).toHaveLength(1)
    expect(result.error.issues.at(0).path).toContain('issuesOrConcerns')
    expect(result.error.issues.at(0).message).toEqual('Enter issues or concerns you identified')
  })

  test('too big input throws max char validation error', () => {
    const formData = { issuesOrConcerns: 'x'.repeat(MAX_CHAR + 1), notifyProbationPractitioner: 'Yes' }
    const result = IssuesOrConcernsFormDataSchema.safeParse(formData)
    expect(result.success).toBeFalsy()
    expect(result.error).toBeDefined()
    expect(result.error.issues).toHaveLength(1)
    expect(result.error.issues.at(0).path).toContain('issuesOrConcerns')
    expect(result.error.issues.at(0).message).toEqual(
      `Details of issues or concerns must be ${MAX_CHAR} characters or less`,
    )
  })

  test("max char validation edge case doesn't throw error", () => {
    const formData = { issuesOrConcerns: 'x'.repeat(MAX_CHAR), notifyProbationPractitioner: 'No' }
    const result = IssuesOrConcernsFormDataSchema.safeParse(formData)
    expect(result.success).toBeTruthy()
    expect(result.error).toBeUndefined()
  })

  test('missing notification selection returns the design error message', () => {
    const result = IssuesOrConcernsFormDataSchema.safeParse({ issuesOrConcerns: 'Test text' })
    expect(result.success).toBeFalsy()
    expect(result.error?.issues).toContainEqual(
      expect.objectContaining({
        path: ['notifyProbationPractitioner'],
        message: 'Select yes if the probation practitioner needs to know about these issues or concerns',
      }),
    )
  })
})
