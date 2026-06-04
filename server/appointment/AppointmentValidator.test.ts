import AppointmentValidator from './AppointmentValidator'

describe('AppointmentValidator', () => {
  let validator: AppointmentValidator

  beforeEach(() => {
    validator = new AppointmentValidator()
  })

  describe('getReasonKey', () => {
    it('returns the key for byPhone', () => {
      expect(validator.getReasonKey('byPhone')).toBe('byPhone')
    })

    it('returns the key for byVideo', () => {
      expect(validator.getReasonKey('byVideo')).toBe('byVideo')
    })

    it('returns the key for inSomewhereElse', () => {
      expect(validator.getReasonKey('inSomewhereElse')).toBe('inSomewhereElse')
    })

    it('returns null for an unrecognised value', () => {
      expect(validator.getReasonKey('inProbationOffice')).toBeNull()
    })
  })
})
