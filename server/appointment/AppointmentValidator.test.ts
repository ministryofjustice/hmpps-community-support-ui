import AppointmentValidator from './AppointmentValidator'

describe('AppointmentValidator', () => {
  let validator: AppointmentValidator

  beforeEach(() => {
    validator = new AppointmentValidator()
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
