import {
  appointmentMethodRequiresLocation,
  buildAppointmentSessionMethodRequest,
  getAppointmentMethodLabel,
  isAppointmentMethod,
} from './appointmentMethod'

describe('appointmentMethod', () => {
  describe('isAppointmentMethod', () => {
    it('returns true for canonical appointment methods only', () => {
      expect(isAppointmentMethod('PHONE')).toBe(true)
      expect(isAppointmentMethod('VIDEO')).toBe(true)
      expect(isAppointmentMethod('IN_PERSON')).toBe(true)
      expect(isAppointmentMethod('IN_PERSON_PROBATION_OFFICE')).toBe(true)
      expect(isAppointmentMethod('IN_PERSON_OTHER_LOCATION')).toBe(true)
      expect(isAppointmentMethod('IN_PERSON_PRISON')).toBe(true)
      expect(isAppointmentMethod('PHONE CALL')).toBe(false)
      expect(isAppointmentMethod('BYPHONE')).toBe(false)
      expect(isAppointmentMethod(undefined)).toBe(false)
    })
  })

  describe('getAppointmentMethodLabel', () => {
    it('returns the correct labels for canonical appointment methods', () => {
      expect(getAppointmentMethodLabel('PHONE')).toBe('Phone call')
      expect(getAppointmentMethodLabel('VIDEO')).toBe('Video call')
      expect(getAppointmentMethodLabel('IN_PERSON')).toBe('In person')
      expect(getAppointmentMethodLabel('IN_PERSON_PROBATION_OFFICE')).toBe('In person (Probation office)')
      expect(getAppointmentMethodLabel('IN_PERSON_OTHER_LOCATION')).toBe('In person (Other location)')
      expect(getAppointmentMethodLabel('IN_PERSON_PRISON')).toBe('In person (Prison)')
    })

    it('falls back to the original value for unknown methods', () => {
      expect(getAppointmentMethodLabel('PHONE CALL')).toBe('PHONE CALL')
      expect(getAppointmentMethodLabel()).toBe('')
    })

    it('normalises legacy method values used in appointment sessions', () => {
      expect(getAppointmentMethodLabel('ByPhone')).toBe('Phone call')
      expect(getAppointmentMethodLabel('ByVideo')).toBe('Video call')
      expect(getAppointmentMethodLabel('InPerson')).toBe('In person')
      expect(getAppointmentMethodLabel('InProbationOffice')).toBe('In person (Probation office)')
      expect(getAppointmentMethodLabel('InSomewhereElse')).toBe('In person (Other location)')
      expect(getAppointmentMethodLabel('InPrison')).toBe('In person (Prison)')
    })
  })

  describe('appointmentMethodRequiresLocation', () => {
    it('recognises each in-person method with a location', () => {
      expect(appointmentMethodRequiresLocation('IN_PERSON_PROBATION_OFFICE')).toBe(true)
      expect(appointmentMethodRequiresLocation('IN_PERSON_OTHER_LOCATION')).toBe(true)
      expect(appointmentMethodRequiresLocation('InPrison')).toBe(true)
      expect(appointmentMethodRequiresLocation('PHONE')).toBe(false)
      expect(appointmentMethodRequiresLocation('IN_PERSON')).toBe(false)
      expect(appointmentMethodRequiresLocation()).toBe(false)
    })
  })

  describe('buildAppointmentSessionMethodRequest', () => {
    it('builds requests for remote methods with their reason when provided', () => {
      expect(buildAppointmentSessionMethodRequest('PHONE', 'Phone reason')).toEqual({
        type: 'PHONE',
        additionalDetails: 'Phone reason',
      })
      expect(buildAppointmentSessionMethodRequest('VIDEO', 'Video reason')).toEqual({
        type: 'VIDEO',
        additionalDetails: 'Video reason',
      })
      expect(buildAppointmentSessionMethodRequest('VIDEO')).toEqual({ type: 'VIDEO' })
      expect(buildAppointmentSessionMethodRequest('IN_PERSON', 'ignored')).toEqual({ type: 'IN_PERSON' })
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

    it('sends a prison code and rejects a missing one', () => {
      expect(buildAppointmentSessionMethodRequest('IN_PERSON_PRISON', 'MDI')).toEqual({
        type: 'IN_PERSON_PRISON',
        prisonCode: 'MDI',
      })
      expect(() => buildAppointmentSessionMethodRequest('IN_PERSON_PRISON', '')).toThrow(
        'A prison code is required to book a prison session',
      )
    })
  })
})
