import AppointmentValidator from './AppointmentValidator'

describe('AppointmentValidator', () => {
  let validator: AppointmentValidator

  beforeEach(() => {
    validator = new AppointmentValidator()
  })

  describe('validateAddressFields', () => {
    it('returns an error when addressLine1 is empty', () => {
      const errors = validator.validateAddressFields('', '', 'London', '', 'N1 6XE')

      expect(errors.addressLine1).toEqual({ text: 'Enter an address line 1' })
    })

    it('returns an error when addressTown is empty', () => {
      const errors = validator.validateAddressFields('123 Main St', '', '', '', 'N1 6XE')

      expect(errors.addressTown).toEqual({ text: 'Enter a town or city' })
    })

    it('returns an error when addressPostcode is empty', () => {
      const errors = validator.validateAddressFields('123 Main St', '', 'London', '', '')

      expect(errors.addressPostcode).toEqual({ text: 'Enter a postcode' })
    })

    it('returns no errors for valid address fields', () => {
      const errors = validator.validateAddressFields('123 Main St', 'Flat 1', 'London', 'Greater London', 'N1 6XE')

      expect(Object.keys(errors)).toHaveLength(0)
    })

    it('returns an error when addressLine1 contains invalid characters', () => {
      const errors = validator.validateAddressFields('123 Main St!', '', 'London', '', 'N1 6XE')

      expect(errors.addressLine1).toEqual({
        text: 'Address line 1 must only include letters a to z, numbers 0 to 9, spaces, hyphens or apostrophes',
      })
    })

    it('returns an error when postcode contains invalid characters', () => {
      const errors = validator.validateAddressFields('123 Main St', '', 'London', '', 'N1!6XE')

      expect(errors.addressPostcode).toEqual({
        text: 'Postcode must only include letters a to z, numbers 0 to 9 or spaces',
      })
    })
  })

  describe('isIdentifierACrn', () => {
    it('returns true for a valid CRN', () => {
      expect(validator.isIdentifierACrn('A123456')).toBe(true)
    })

    it('returns false for an invalid CRN', () => {
      expect(validator.isIdentifierACrn('A12345')).toBe(false)
      expect(validator.isIdentifierACrn('1234567')).toBe(false)
      expect(validator.isIdentifierACrn('')).toBe(false)
    })
  })

  describe('isIdentifierAPrisonNumber', () => {
    it('returns true for a valid prison number', () => {
      expect(validator.isIdentifierAPrisonNumber('A1234BC')).toBe(true)
    })

    it('returns false for an invalid prison number', () => {
      expect(validator.isIdentifierAPrisonNumber('A123456')).toBe(false)
      expect(validator.isIdentifierAPrisonNumber('')).toBe(false)
    })
  })

  describe('isPersonInCommunity', () => {
    it('returns true when the identifier is a valid CRN', () => {
      expect(validator.isPersonInCommunity('A123456')).toBe(true)
    })

    it('returns false when the identifier is not a CRN', () => {
      expect(validator.isPersonInCommunity('A1234BC')).toBe(false)
    })
  })

  describe('isPersonInPrison', () => {
    it('returns true when the identifier is a valid prison number', () => {
      expect(validator.isPersonInPrison('A1234BC')).toBe(true)
    })

    it('returns false when the identifier is not a prison number', () => {
      expect(validator.isPersonInPrison('A123456')).toBe(false)
    })
  })

  describe('getReasonKey', () => {
    it('returns the key for ByPhone', () => {
      expect(validator.getReasonKey('ByPhone')).toBe('ByPhone')
    })

    it('returns the key for ByVideo', () => {
      expect(validator.getReasonKey('ByVideo')).toBe('ByVideo')
    })

    it('returns the key for InSomewhereElse', () => {
      expect(validator.getReasonKey('InSomewhereElse')).toBe('InSomewhereElse')
    })

    it('returns null for an unrecognised value', () => {
      expect(validator.getReasonKey('InProbationOffice')).toBeNull()
    })
  })
})
