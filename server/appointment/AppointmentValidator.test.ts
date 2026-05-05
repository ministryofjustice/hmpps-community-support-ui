import { Request } from 'express'
import AppointmentValidator from './AppointmentValidator'

describe('AppointmentValidator', () => {
  let validator: AppointmentValidator

  beforeEach(() => {
    validator = new AppointmentValidator()
  })

  const makeReq = (body: Record<string, unknown>): Request => ({ body }) as unknown as Request

  describe('phoneCallErrorMessage', () => {
    it('returns the correct message for PHONE', () => {
      expect(validator.validationsErrorMessage('PHONE')).toBe('Select yes if the session took place by phone call')
    })

    it('returns the correct message for VIDEO', () => {
      expect(validator.validationsErrorMessage('VIDEO')).toBe('Select yes if the session took place by video call')
    })

    it('returns the correct message for IN_PERSON_PROBATION_OFFICE', () => {
      expect(validator.validationsErrorMessage('IN_PERSON_PROBATION_OFFICE')).toBe(
        'Select yes if the session took place in person at probation office',
      )
    })

    it('returns the correct message for IN_PERSON_OTHER_LOCATION', () => {
      expect(validator.validationsErrorMessage('IN_PERSON_OTHER_LOCATION')).toBe(
        'Select yes if the session took place in person at this location',
      )
    })

    it('returns a generic fallback message for an unknown type', () => {
      expect(validator.validationsErrorMessage('UNKNOWN')).toBe('Select yes if the session took place')
    })
  })

  describe('validateIcsFeedbackForm', () => {
    it('returns an error when phoneCall is not selected - PHONE session', () => {
      const { formData, errors } = validator.validateIcsFeedbackForm(makeReq({}), 'PHONE')

      expect(formData.phoneCall).toBe('')
      expect(errors).toEqual(
        expect.objectContaining({
          phoneCall: { text: 'Select yes if the session took place by phone call' },
        }),
      )
    })

    it('returns an error when phoneCall is not selected - VIDEO session', () => {
      const { formData, errors } = validator.validateIcsFeedbackForm(makeReq({}), 'VIDEO')

      expect(formData.phoneCall).toBe('')
      expect(errors).toEqual(
        expect.objectContaining({
          phoneCall: { text: 'Select yes if the session took place by video call' },
        }),
      )
    })

    it('returns an error when phoneCall is not selected - IN_PERSON_PROBATION_OFFICE session', () => {
      const { formData, errors } = validator.validateIcsFeedbackForm(makeReq({}), 'IN_PERSON_PROBATION_OFFICE')

      expect(formData.phoneCall).toBe('')
      expect(errors).toEqual(
        expect.objectContaining({
          phoneCall: { text: 'Select yes if the session took place in person at probation office' },
        }),
      )
    })

    it('returns an error when phoneCall is not selected - IN_PERSON_OTHER_LOCATION session', () => {
      const { formData, errors } = validator.validateIcsFeedbackForm(makeReq({}), 'IN_PERSON_OTHER_LOCATION')

      expect(formData.phoneCall).toBe('')
      expect(errors).toEqual(
        expect.objectContaining({
          phoneCall: { text: 'Select yes if the session took place in person at this location' },
        }),
      )
    })

    it('returns an error when phoneCall is "no" but howSessionTookPlace is not selected', () => {
      const { formData, errors } = validator.validateIcsFeedbackForm(
        makeReq({ phoneCall: 'no', howSessionTookPlace: '' }),
        'PHONE',
      )

      expect(formData.phoneCall).toBe('no')
      expect(formData.howSessionTookPlace).toBe('')
      expect(errors).toEqual(
        expect.objectContaining({
          howSessionTookPlace: { text: 'Select how the session took place' },
        }),
      )
    })

    it('returns an error when PHONE is selected without a reason', () => {
      const { formData, errors } = validator.validateIcsFeedbackForm(
        makeReq({ phoneCall: 'no', howSessionTookPlace: 'PHONE', phoneCallReason: '' }),
        'VIDEO',
      )

      expect(formData.howSessionTookPlace).toBe('PHONE')
      expect(errors).toEqual(
        expect.objectContaining({
          phoneCallReason: { text: 'Enter why the session was not in person' },
        }),
      )
    })

    it('returns no errors for a valid PHONE submission with a reason', () => {
      const { errors } = validator.validateIcsFeedbackForm(
        makeReq({ phoneCall: 'no', howSessionTookPlace: 'PHONE', phoneCallReason: 'No video available' }),
        'VIDEO',
      )

      expect(Object.keys(errors)).toHaveLength(0)
    })

    it('returns an error when VIDEO is selected without a reason', () => {
      const { formData, errors } = validator.validateIcsFeedbackForm(
        makeReq({ phoneCall: 'no', howSessionTookPlace: 'VIDEO', videoCallReason: '' }),
        'PHONE',
      )

      expect(formData.howSessionTookPlace).toBe('VIDEO')
      expect(errors).toEqual(
        expect.objectContaining({
          videoCallReason: { text: 'Enter why the session was not in person' },
        }),
      )
    })

    it('returns an error when IN_PERSON_PROBATION_OFFICE is selected without a PDU', () => {
      const { formData, errors } = validator.validateIcsFeedbackForm(
        makeReq({ phoneCall: 'no', howSessionTookPlace: 'IN_PERSON_PROBATION_OFFICE', probationDeliveryUnit: '' }),
        'PHONE',
      )

      expect(formData.howSessionTookPlace).toBe('IN_PERSON_PROBATION_OFFICE')
      expect(errors).toEqual(
        expect.objectContaining({
          probationDeliveryUnit: { text: 'Select a probation office' },
        }),
      )
    })

    it('returns address validation errors when IN_PERSON_OTHER_LOCATION is selected with missing required fields', () => {
      const { formData, errors } = validator.validateIcsFeedbackForm(
        makeReq({
          phoneCall: 'no',
          howSessionTookPlace: 'IN_PERSON_OTHER_LOCATION',
          addressLine1: '',
          addressLine2: '',
          townOrCity: '',
          county: '',
          postcode: '',
        }),
        'PHONE',
      )

      expect(formData.howSessionTookPlace).toBe('IN_PERSON_OTHER_LOCATION')
      expect(errors).toEqual(
        expect.objectContaining({
          addressLine1: expect.objectContaining({ text: expect.stringContaining('address line 1') }),
          townOrCity: expect.objectContaining({ text: expect.stringContaining('town or city') }),
          postcode: expect.objectContaining({ text: expect.stringContaining('postcode') }),
        }),
      )
    })

    it('returns no errors for a valid phoneCall yes submission', () => {
      const { errors } = validator.validateIcsFeedbackForm(makeReq({ phoneCall: 'yes' }), 'PHONE')

      expect(Object.keys(errors)).toHaveLength(0)
    })

    it('returns no errors for a valid VIDEO submission with a reason', () => {
      const { errors } = validator.validateIcsFeedbackForm(
        makeReq({ phoneCall: 'no', howSessionTookPlace: 'VIDEO', videoCallReason: 'Teams only' }),
        'PHONE',
      )

      expect(Object.keys(errors)).toHaveLength(0)
    })

    it('returns no errors for a valid IN_PERSON_PROBATION_OFFICE submission', () => {
      const { errors } = validator.validateIcsFeedbackForm(
        makeReq({
          phoneCall: 'no',
          howSessionTookPlace: 'IN_PERSON_PROBATION_OFFICE',
          probationDeliveryUnit: 'PDU-123',
        }),
        'PHONE',
      )

      expect(Object.keys(errors)).toHaveLength(0)
    })

    it('returns no errors for a valid IN_PERSON_OTHER_LOCATION submission', () => {
      const { errors } = validator.validateIcsFeedbackForm(
        makeReq({
          phoneCall: 'no',
          howSessionTookPlace: 'IN_PERSON_OTHER_LOCATION',
          addressLine1: '56 Carlisle Road',
          addressLine2: '',
          townOrCity: 'London',
          county: '',
          postcode: 'N1 6XE',
        }),
        'PHONE',
      )

      expect(Object.keys(errors)).toHaveLength(0)
    })

    it('validates address fields when IN_PERSON_OTHER_LOCATION selected as alternative for an IN_PERSON_OTHER_LOCATION session', () => {
      const { formData, errors } = validator.validateIcsFeedbackForm(
        makeReq({
          phoneCall: 'no',
          howSessionTookPlace: 'IN_PERSON_OTHER_LOCATION',
          addressLine1: '',
          addressLine2: '',
          townOrCity: '',
          county: '',
          postcode: '',
        }),
        'IN_PERSON_OTHER_LOCATION',
      )

      expect(formData.howSessionTookPlace).toBe('IN_PERSON_OTHER_LOCATION')
      expect(errors).toEqual(
        expect.objectContaining({
          addressLine1: expect.objectContaining({ text: expect.stringContaining('address line 1') }),
          townOrCity: expect.objectContaining({ text: expect.stringContaining('town or city') }),
          postcode: expect.objectContaining({ text: expect.stringContaining('postcode') }),
        }),
      )
    })

    it('returns no errors when IN_PERSON_OTHER_LOCATION selected as alternative for an IN_PERSON_OTHER_LOCATION session with valid address', () => {
      const { errors } = validator.validateIcsFeedbackForm(
        makeReq({
          phoneCall: 'no',
          howSessionTookPlace: 'IN_PERSON_OTHER_LOCATION',
          addressLine1: '12 New Street',
          addressLine2: '',
          townOrCity: 'Manchester',
          county: '',
          postcode: 'M1 1AA',
        }),
        'IN_PERSON_OTHER_LOCATION',
      )

      expect(Object.keys(errors)).toHaveLength(0)
    })
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
