import { NextStepsFormDataSchema } from './NextStepsFormData'

const MAX_CHAR = 3000

describe('NextStepsFormData', () => {
  test('happy path', () => {
    const formData = {
      plannedForNextSession: 'Plan text',
      actionsBeforeNextSession: 'Action text',
    }
    const result = NextStepsFormDataSchema.safeParse(formData)
    expect(result.success).toBeTruthy()
    expect(result.error).toBeUndefined()
  })

  test('plannedForNextSession empty input throws empty validation error', () => {
    const formData = { plannedForNextSession: '', actionsBeforeNextSession: 'Action text' }
    const result = NextStepsFormDataSchema.safeParse(formData)
    expect(result.success).toBeFalsy()
    expect(result.error).toBeDefined()
    expect(result.error.issues).toHaveLength(1)
    expect(result.error.issues.at(0).path).toContain('plannedForNextSession')
    expect(result.error.issues.at(0).message).toEqual('Enter what you have planned for the next session')
  })

  test('actionsBeforeNextSession empty input throws empty validation error', () => {
    const formData = { plannedForNextSession: 'Plan text', actionsBeforeNextSession: '' }
    const result = NextStepsFormDataSchema.safeParse(formData)
    expect(result.success).toBeFalsy()
    expect(result.error).toBeDefined()
    expect(result.error.issues).toHaveLength(1)
    expect(result.error.issues.at(0).path).toContain('actionsBeforeNextSession')
    expect(result.error.issues.at(0).message).toEqual(
      'Enter what actions you have before the next session takes place ',
    )
  })

  test('plannedForNextSession too big input throws max char validation error', () => {
    const formData = { plannedForNextSession: 'x'.repeat(MAX_CHAR + 1), actionsBeforeNextSession: 'Action' }
    const result = NextStepsFormDataSchema.safeParse(formData)
    expect(result.success).toBeFalsy()
    expect(result.error).toBeDefined()
    expect(result.error.issues).toHaveLength(1)
    expect(result.error.issues.at(0).path).toContain('plannedForNextSession')
    expect(result.error.issues.at(0).message).toEqual(
      `Details about what you have planned for the next session must be ${MAX_CHAR} characters or less`,
    )
  })

  test('actionsBeforeNextSession too big input throws max char validation error', () => {
    const formData = { plannedForNextSession: 'Plan', actionsBeforeNextSession: 'x'.repeat(MAX_CHAR + 1) }
    const result = NextStepsFormDataSchema.safeParse(formData)
    expect(result.success).toBeFalsy()
    expect(result.error).toBeDefined()
    expect(result.error.issues).toHaveLength(1)
    expect(result.error.issues.at(0).path).toContain('actionsBeforeNextSession')
    expect(result.error.issues.at(0).message).toEqual(
      `Details about what actions you have before the next session takes place must be ${MAX_CHAR} characters or less`,
    )
  })

  test("max char validation edge case doesn't throw error for both fields", () => {
    const formData = {
      plannedForNextSession: 'x'.repeat(MAX_CHAR),
      actionsBeforeNextSession: 'x'.repeat(MAX_CHAR),
    }
    const result = NextStepsFormDataSchema.safeParse(formData)
    expect(result.success).toBeTruthy()
    expect(result.error).toBeUndefined()
  })
})
