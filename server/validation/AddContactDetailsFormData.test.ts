import { AddContactDetailsSchema, AddContactDetailsSchemaBuilder } from './AddContactDetailsFormData'

describe('AddContactDetailsSchema', () => {
  const validPayload = {
    name: 'John Doe',
    emailAddress: 'john.doe@example.com',
    jobRole: 'Probation Officer',
    phoneNumber: '01632 960 001',
    pdu: JSON.stringify({ id: 'pdu-1', name: 'London PDU' }),
    teamPhoneNumber: '07700 900 982',
  }

  describe('name field', () => {
    test('accepts a valid name', () => {
      const result = AddContactDetailsSchema.safeParse(validPayload)
      expect(result.success).toBe(true)
    })

    test('rejects empty name', () => {
      const result = AddContactDetailsSchema.safeParse({
        ...validPayload,
        name: '',
      })

      expect(result.success).toBe(false)
      if (result.error) {
        const error = result.error.issues.find(issue => issue.path.includes('name'))
        expect(error?.message).toBe('Enter a name')
      }
    })

    test('rejects name that is too long', () => {
      const result = AddContactDetailsSchema.safeParse({
        ...validPayload,
        name: 'a'.repeat(65001),
      })

      expect(result.success).toBe(false)
      if (result.error) {
        const error = result.error.issues.find(issue => issue.path.includes('name'))
        expect(error?.message).toBe('Name must be 65000 characters or less')
      }
    })

    test('accepts name at max length', () => {
      const result = AddContactDetailsSchema.safeParse({
        ...validPayload,
        name: 'a'.repeat(65000),
      })

      expect(result.success).toBe(true)
    })
  })

  describe('emailAddress field', () => {
    test('accepts a valid emailAddress', () => {
      const result = AddContactDetailsSchema.safeParse(validPayload)
      expect(result.success).toBe(true)
    })

    test('rejects empty emailAddress', () => {
      const result = AddContactDetailsSchema.safeParse({
        ...validPayload,
        emailAddress: '',
      })

      expect(result.success).toBe(false)
      if (result.error) {
        const error = result.error.issues.find(issue => issue.path.includes('emailAddress'))
        expect(error?.message).toBe('Enter an email address')
      }
    })

    test('rejects invalid emailAddress format', () => {
      const result = AddContactDetailsSchema.safeParse({
        ...validPayload,
        emailAddress: 'invalid-email',
      })

      expect(result.success).toBe(false)
      if (result.error) {
        const error = result.error.issues.find(issue => issue.path.includes('emailAddress'))
        expect(error?.message).toBe('Enter an email address in the correct format, like name@example.com')
      }
    })

    test('rejects emailAddress that is too long', () => {
      const result = AddContactDetailsSchema.safeParse({
        ...validPayload,
        emailAddress: `${'a'.repeat(65001)}@example.com`,
      })

      expect(result.success).toBe(false)
      if (result.error) {
        const error = result.error.issues.find(issue => issue.path.includes('emailAddress'))
        expect(error?.message).toBe('Email must be 65000 characters or less')
      }
    })

    test('accepts various valid emailAddress formats', () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user_name@example-domain.com',
      ]

      validEmails.forEach(emailAddress => {
        const result = AddContactDetailsSchema.safeParse({
          ...validPayload,
          emailAddress,
        })
        expect(result.success).toBe(true)
      })
    })
  })

  describe('jobRole field', () => {
    test('accepts a valid job role', () => {
      const result = AddContactDetailsSchema.safeParse(validPayload)
      expect(result.success).toBe(true)
    })

    test('accepts empty job role (optional field)', () => {
      const result = AddContactDetailsSchema.safeParse({
        ...validPayload,
        jobRole: '',
      })

      expect(result.success).toBe(true)
    })

    test('accepts undefined job role', () => {
      const { jobRole, ...payloadWithoutJobRole } = validPayload
      const result = AddContactDetailsSchema.safeParse(payloadWithoutJobRole)

      expect(result.success).toBe(true)
    })

    test('rejects job role that is too long', () => {
      const result = AddContactDetailsSchema.safeParse({
        ...validPayload,
        jobRole: 'a'.repeat(65001),
      })

      expect(result.success).toBe(false)
      if (result.error) {
        const error = result.error.issues.find(issue => issue.path.includes('jobRole'))
        expect(error?.message).toBe('Job role must be 65000 characters or less')
      }
    })
  })

  describe('phoneNumber field', () => {
    test('accepts a valid phone number', () => {
      const result = AddContactDetailsSchema.safeParse(validPayload)
      expect(result.success).toBe(true)
    })

    test('accepts empty phone number (optional field)', () => {
      const result = AddContactDetailsSchema.safeParse({
        ...validPayload,
        phoneNumber: '',
      })

      expect(result.success).toBe(true)
    })

    test('accepts undefined phone number', () => {
      const { phoneNumber, ...payloadWithoutPhone } = validPayload
      const result = AddContactDetailsSchema.safeParse(payloadWithoutPhone)

      expect(result.success).toBe(true)
    })

    test('accepts various valid phone number formats', () => {
      const validPhoneNumbers = [
        '01632 960 001',
        '07700 900 982',
        '+44 808 157 0192',
        '(0161) 123 4567',
        '01234567890',
        '+44 20 7123 4567',
      ]

      validPhoneNumbers.forEach(phoneNumber => {
        const result = AddContactDetailsSchema.safeParse({
          ...validPayload,
          phoneNumber,
        })
        expect(result.success).toBe(true)
      })
    })

    test('rejects invalid phone number format', () => {
      const result = AddContactDetailsSchema.safeParse({
        ...validPayload,
        phoneNumber: 'not-a-phone-number',
      })

      expect(result.success).toBe(false)
      if (result.error) {
        const error = result.error.issues.find(issue => issue.path.includes('phoneNumber'))
        expect(error?.message).toBe('Enter a phone number, like 01632 960 001, 07700 900 982 or +44 808 157 0192')
      }
    })

    test('rejects phone number that is too long', () => {
      const result = AddContactDetailsSchema.safeParse({
        ...validPayload,
        phoneNumber: '1'.repeat(65001),
      })

      expect(result.success).toBe(false)
      if (result.error) {
        const error = result.error.issues.find(issue => issue.path.includes('phoneNumber'))
        expect(error?.message).toBe('Phone number must be 65000 characters or less')
      }
    })
  })

  describe('pdu field', () => {
    test('accepts a valid PDU', () => {
      const result = AddContactDetailsSchema.safeParse(validPayload)
      expect(result.success).toBe(true)
    })

    test('rejects empty PDU', () => {
      const result = AddContactDetailsSchema.safeParse({
        ...validPayload,
        pdu: '',
      })

      expect(result.success).toBe(false)
      if (result.error) {
        const error = result.error.issues.find(issue => issue.path.includes('pdu'))
        expect(error?.message).toBe('Enter a PDU')
      }
    })

    test('rejects malformed JSON instead of throwing', () => {
      const result = AddContactDetailsSchema.safeParse({
        ...validPayload,
        pdu: '{not json',
      })

      expect(result.success).toBe(false)
      if (result.error) {
        const error = result.error.issues.find(issue => issue.path.includes('pdu'))
        expect(error?.message).toBe('Select a PDU from the list')
      }
    })

    test('rejects an object missing id/name', () => {
      const result = AddContactDetailsSchema.safeParse({
        ...validPayload,
        pdu: '{}',
      })

      expect(result.success).toBe(false)
      if (result.error) {
        const error = result.error.issues.find(issue => issue.path.includes('pdu'))
        expect(error?.message).toBe('Select a PDU from the list')
      }
    })

    test('rejects a PDU id that is not in the allowed list', () => {
      const schema = AddContactDetailsSchemaBuilder(['pdu-1', 'pdu-2'])
      const result = schema.safeParse({
        ...validPayload,
        pdu: JSON.stringify({ id: 'not-a-real-pdu', name: 'Fake PDU' }),
      })

      expect(result.success).toBe(false)
      if (result.error) {
        const error = result.error.issues.find(issue => issue.path.includes('pdu'))
        expect(error?.message).toBe('Select a PDU from the list')
      }
    })

    test('rejects malformed pdu JSON without throwing when an allow-list is supplied', () => {
      const schema = AddContactDetailsSchemaBuilder(['pdu-1', 'pdu-2'])

      expect(() => schema.safeParse({ ...validPayload, pdu: '{not json' })).not.toThrow()
      const result = schema.safeParse({ ...validPayload, pdu: '{not json' })

      expect(result.success).toBe(false)
      if (result.error) {
        const error = result.error.issues.find(issue => issue.path.includes('pdu'))
        expect(error?.message).toBe('Select a PDU from the list')
      }
    })

    test('accepts a PDU id that is in the allowed list', () => {
      const schema = AddContactDetailsSchemaBuilder(['pdu-1', 'pdu-2'])
      const result = schema.safeParse(validPayload)

      expect(result.success).toBe(true)
    })

    test('fails closed and rejects any PDU when an empty allow-list is supplied (e.g. the API returned no PDUs)', () => {
      const schema = AddContactDetailsSchemaBuilder([])
      const result = schema.safeParse(validPayload)

      expect(result.success).toBe(false)
      if (result.error) {
        const error = result.error.issues.find(issue => issue.path.includes('pdu'))
        expect(error?.message).toBe('Select a PDU from the list')
      }
    })
  })

  describe('probationOffice field', () => {
    test('accepts an unset probationOffice', () => {
      const result = AddContactDetailsSchema.safeParse(validPayload)
      expect(result.success).toBe(true)
    })

    test('accepts an empty probationOffice', () => {
      const result = AddContactDetailsSchema.safeParse({ ...validPayload, probationOffice: '' })
      expect(result.success).toBe(true)
    })

    test('rejects malformed JSON', () => {
      const result = AddContactDetailsSchema.safeParse({ ...validPayload, probationOffice: '{not json' })

      expect(result.success).toBe(false)
      if (result.error) {
        const error = result.error.issues.find(issue => issue.path.includes('probationOffice'))
        expect(error?.message).toBe('Select a probation office from the list')
      }
    })

    test('rejects a probationOffice id that is not in the allowed list', () => {
      const schema = AddContactDetailsSchemaBuilder(undefined, [1, 2])
      const result = schema.safeParse({
        ...validPayload,
        probationOffice: JSON.stringify({ id: 999, name: 'Fake Office' }),
      })

      expect(result.success).toBe(false)
      if (result.error) {
        const error = result.error.issues.find(issue => issue.path.includes('probationOffice'))
        expect(error?.message).toBe('Select a probation office from the list')
      }
    })

    test('rejects malformed probationOffice JSON without throwing when an allow-list is supplied', () => {
      const schema = AddContactDetailsSchemaBuilder(undefined, [1, 2])

      expect(() => schema.safeParse({ ...validPayload, probationOffice: '{not json' })).not.toThrow()
      const result = schema.safeParse({ ...validPayload, probationOffice: '{not json' })

      expect(result.success).toBe(false)
      if (result.error) {
        const error = result.error.issues.find(issue => issue.path.includes('probationOffice'))
        expect(error?.message).toBe('Select a probation office from the list')
      }
    })

    test('accepts a probationOffice id that is in the allowed list', () => {
      const schema = AddContactDetailsSchemaBuilder(undefined, [1, 2])
      const result = schema.safeParse({
        ...validPayload,
        probationOffice: JSON.stringify({ id: 1, name: 'Real Office' }),
      })

      expect(result.success).toBe(true)
    })

    test('fails closed and rejects any probationOffice when an empty allow-list is supplied (e.g. the API returned none)', () => {
      const schema = AddContactDetailsSchemaBuilder(undefined, [])
      const result = schema.safeParse({
        ...validPayload,
        probationOffice: JSON.stringify({ id: 1, name: 'Real Office' }),
      })

      expect(result.success).toBe(false)
      if (result.error) {
        const error = result.error.issues.find(issue => issue.path.includes('probationOffice'))
        expect(error?.message).toBe('Select a probation office from the list')
      }
    })
  })

  describe('teamPhoneNumber field', () => {
    test('accepts a valid team phone number', () => {
      const result = AddContactDetailsSchema.safeParse(validPayload)
      expect(result.success).toBe(true)
    })

    test('accepts empty team phone number (optional field)', () => {
      const result = AddContactDetailsSchema.safeParse({
        ...validPayload,
        teamPhoneNumber: '',
      })

      expect(result.success).toBe(true)
    })

    test('accepts undefined team phone number', () => {
      const { teamPhoneNumber, ...payloadWithoutTeamPhone } = validPayload
      const result = AddContactDetailsSchema.safeParse(payloadWithoutTeamPhone)

      expect(result.success).toBe(true)
    })

    test('accepts various valid team phone number formats', () => {
      const validPhoneNumbers = ['01632 960 001', '07700 900 982', '+44 808 157 0192', '(0161) 123 4567', '01234567890']

      validPhoneNumbers.forEach(teamPhoneNumber => {
        const result = AddContactDetailsSchema.safeParse({
          ...validPayload,
          teamPhoneNumber,
        })
        expect(result.success).toBe(true)
      })
    })

    test('rejects invalid team phone number format', () => {
      const result = AddContactDetailsSchema.safeParse({
        ...validPayload,
        teamPhoneNumber: 'invalid-phone',
      })

      expect(result.success).toBe(false)
      if (result.error) {
        const error = result.error.issues.find(issue => issue.path.includes('teamPhoneNumber'))
        expect(error?.message).toBe('Enter a phone number, like 01632 960 001, 07700 900 982 or +44 808 157 0192')
      }
    })

    test('rejects team phone number that is too long', () => {
      const result = AddContactDetailsSchema.safeParse({
        ...validPayload,
        teamPhoneNumber: '1'.repeat(65001),
      })

      expect(result.success).toBe(false)
      if (result.error) {
        const error = result.error.issues.find(issue => issue.path.includes('teamPhoneNumber'))
        expect(error?.message).toBe('Team phone number must be 65000 characters or less')
      }
    })
  })

  describe('complete form validation', () => {
    test('accepts minimal valid payload (only required fields)', () => {
      const minimalPayload = {
        name: 'John Doe',
        emailAddress: 'john@example.com',
        pdu: JSON.stringify({ id: 'pdu-1', name: 'London PDU' }),
      }

      const result = AddContactDetailsSchema.safeParse(minimalPayload)
      expect(result.success).toBe(true)
    })

    test('accepts complete valid payload (all fields)', () => {
      const result = AddContactDetailsSchema.safeParse(validPayload)
      expect(result.success).toBe(true)
    })

    test('reports multiple validation errors', () => {
      const result = AddContactDetailsSchema.safeParse({
        name: '',
        emailAddress: '',
        jobRole: 'a'.repeat(65001),
        phoneNumber: 'invalid',
        pdu: '',
        teamPhoneNumber: 'invalid',
      })

      expect(result.success).toBe(false)
      if (result.error) {
        expect(result.error.issues.length).toBeGreaterThan(1)
        const errorFields = result.error.issues.map(issue => issue.path[0])
        expect(errorFields).toContain('name')
        expect(errorFields).toContain('emailAddress')
        expect(errorFields).toContain('pdu')
      }
    })
  })
})
