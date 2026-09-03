import { AddContactDetailsSchema } from './AddContactDetailsFormData'

describe('AddContactDetailsSchema', () => {
  const validPayload = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    jobRole: 'Probation Officer',
    phoneNumber: '01632 960 001',
    pdu: 'London PDU',
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

  describe('email field', () => {
    test('accepts a valid email', () => {
      const result = AddContactDetailsSchema.safeParse(validPayload)
      expect(result.success).toBe(true)
    })

    test('rejects empty email', () => {
      const result = AddContactDetailsSchema.safeParse({
        ...validPayload,
        email: '',
      })

      expect(result.success).toBe(false)
      if (result.error) {
        const error = result.error.issues.find(issue => issue.path.includes('email'))
        expect(error?.message).toBe('Enter an email address')
      }
    })

    test('rejects invalid email format', () => {
      const result = AddContactDetailsSchema.safeParse({
        ...validPayload,
        email: 'invalid-email',
      })

      expect(result.success).toBe(false)
      if (result.error) {
        const error = result.error.issues.find(issue => issue.path.includes('email'))
        expect(error?.message).toBe('Enter an email address in the correct format, like name@example.com')
      }
    })

    test('rejects email that is too long', () => {
      const result = AddContactDetailsSchema.safeParse({
        ...validPayload,
        email: `${'a'.repeat(65001)}@example.com`,
      })

      expect(result.success).toBe(false)
      if (result.error) {
        const error = result.error.issues.find(issue => issue.path.includes('email'))
        expect(error?.message).toBe('Email must be 65000 characters or less')
      }
    })

    test('accepts various valid email formats', () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user_name@example-domain.com',
      ]

      validEmails.forEach(email => {
        const result = AddContactDetailsSchema.safeParse({
          ...validPayload,
          email,
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
        email: 'john@example.com',
        pdu: 'London PDU',
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
        email: '',
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
        expect(errorFields).toContain('email')
        expect(errorFields).toContain('pdu')
      }
    })
  })
})
