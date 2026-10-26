import {
  buildAppointmentSessionMethodRequest,
  getAppointmentMethodLabel,
  isAppointmentMethod,
} from './appointmentMethod'

describe('appointmentMethod', () => {
  describe('isAppointmentMethod', () => {
    it('returns true for canonical appointment methods only', () => {
      expect(isAppointmentMethod('PHONE')).toBe(true)
      expect(isAppointmentMethod('VIDEO')).toBe(true)
      expect(isAppointmentMethod('IN_PERSON_PROBATION_OFFICE')).toBe(true)
      expect(isAppointmentMethod('IN_PERSON_OTHER_LOCATION')).toBe(true)
      expect(isAppointmentMethod('PHONE CALL')).toBe(false)
      expect(isAppointmentMethod('BYPHONE')).toBe(false)
      expect(isAppointmentMethod(undefined)).toBe(false)
    })
  })

  describe('getAppointmentMethodLabel', () => {
    it('returns the correct labels for canonical appointment methods', () => {
      expect(getAppointmentMethodLabel('PHONE')).toBe('Phone call')
      expect(getAppointmentMethodLabel('VIDEO')).toBe('Video call')
      expect(getAppointmentMethodLabel('IN_PERSON_PROBATION_OFFICE')).toBe('In person (Probation office)')
      expect(getAppointmentMethodLabel('IN_PERSON_OTHER_LOCATION')).toBe('In person (Other location)')
    })

    it('falls back to the original value for unknown methods', () => {
      expect(getAppointmentMethodLabel('PHONE CALL')).toBe('PHONE CALL')
      expect(getAppointmentMethodLabel()).toBe('')
    })

    it('normalises legacy method values used in appointment sessions', () => {
      expect(getAppointmentMethodLabel('ByPhone')).toBe('Phone call')
      expect(getAppointmentMethodLabel('ByVideo')).toBe('Video call')
      expect(getAppointmentMethodLabel('InProbationOffice')).toBe('In person (Probation office)')
      expect(getAppointmentMethodLabel('InSomewhereElse')).toBe('In person (Other location)')
    })
  })

  describe('buildAppointmentSessionMethodRequest', () => {
    it('builds requests for remote methods without additional details', () => {
      expect(buildAppointmentSessionMethodRequest('PHONE', 'ignored')).toEqual({ type: 'PHONE' })
      expect(buildAppointmentSessionMethodRequest('VIDEO')).toEqual({ type: 'VIDEO' })
    })

    it('builds requests for in-person methods with additional details', () => {
      expect(buildAppointmentSessionMethodRequest('IN_PERSON_PROBATION_OFFICE', 'Derby')).toEqual({
        type: 'IN_PERSON_PROBATION_OFFICE',
        additionalDetails: 'Derby',
      })
      expect(buildAppointmentSessionMethodRequest('IN_PERSON_OTHER_LOCATION', 'Library')).toEqual({
        type: 'IN_PERSON_OTHER_LOCATION',
        additionalDetails: 'Library',
      })
    })

    it('falls back to PHONE when no method is set', () => {
      expect(buildAppointmentSessionMethodRequest(undefined, 'ignored')).toEqual({ type: 'PHONE' })
    })
  })
})
