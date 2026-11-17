import { DidAttendFormDataSchema } from './DidAttendFormData'

describe('DidAttendFormDataSchema', () => {
  it.each(['Yes', 'No'])('accepts %s', didAttend => {
    expect(DidAttendFormDataSchema.safeParse({ didAttend }).success).toBe(true)
  })

  it.each([{}, { didAttend: '' }, { didAttend: 'Maybe' }, { didAttend: 'yes' }])('rejects %j', body => {
    const result = DidAttendFormDataSchema.safeParse(body)

    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('Select yes if they came to the appointment')
  })
})
