import icsFeedbackHowTheyTriedToContactThePersonFormDataSchema from './icsFeedbackHowTheyTriedToContactThePersonFormDataSchema'

describe('icsFeedbackHowTheyTriedToContactThePersonFormDataSchema', () => {
  const schema = icsFeedbackHowTheyTriedToContactThePersonFormDataSchema()

  test('accepts both answers', () => {
    const result = schema.safeParse({
      howTheyTriedToContactThePerson: 'Called twice',
      reasonsTheyDidNotAttend: 'They were unwell',
    })

    expect(result.success).toBe(true)
  })

  test('requires contact attempts', () => {
    const result = schema.safeParse({
      howTheyTriedToContactThePerson: '',
      reasonsTheyDidNotAttend: 'They were unwell',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]).toMatchObject({
        path: ['howTheyTriedToContactThePerson'],
        message: 'Enter how you tried to contact them',
      })
    }
  })

  test('requires a reason for non-attendance', () => {
    const result = schema.safeParse({
      howTheyTriedToContactThePerson: 'Called twice',
      reasonsTheyDidNotAttend: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]).toMatchObject({
        path: ['reasonsTheyDidNotAttend'],
        message: 'Enter a reason they did not attend',
      })
    }
  })

  test('limits contact attempts to 400 characters', () => {
    const result = schema.safeParse({
      howTheyTriedToContactThePerson: 'a'.repeat(401),
      reasonsTheyDidNotAttend: 'They were unwell',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]).toMatchObject({
        path: ['howTheyTriedToContactThePerson'],
        message: 'How you tried to contact them must be 400 characters or less',
      })
    }
  })

  test('limits reason for non-attendance to 400 characters', () => {
    const result = schema.safeParse({
      howTheyTriedToContactThePerson: 'Called twice',
      reasonsTheyDidNotAttend: 'a'.repeat(401),
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]).toMatchObject({
        path: ['reasonsTheyDidNotAttend'],
        message: 'A reason they did not attend must be 400 characters or less',
      })
    }
  })
})
