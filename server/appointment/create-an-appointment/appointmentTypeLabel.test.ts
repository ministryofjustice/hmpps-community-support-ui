import { AppointmentTypeLabel, getAppointmentTypeLabel } from './appointmentTypeLabel'

describe('getAppointmentTypeLabel', () => {
  it.each([
    ['CONTACT_SESSION', 'Contact session'],
    ['PRE_RELEASE_SESSION', 'Pre-release session'],
    ['POST_RELEASE_SESSION', 'Post-release session'],
    ['HANDOVER_SESSION', 'Handover session'],
    ['ICS', 'Initial contact session'],
  ])('formats %s as %s', (value, expected) => {
    expect(getAppointmentTypeLabel(value)).toBe(expected)
  })

  it('exposes display labels through the enum', () => {
    expect(AppointmentTypeLabel.CONTACT_SESSION).toBe('Contact session')
  })

  it('normalises API appointment type aliases', () => {
    expect(getAppointmentTypeLabel('pre_release')).toBe('Pre-release session')
  })

  it('preserves an unrecognised appointment type', () => {
    expect(getAppointmentTypeLabel('OTHER_SESSION')).toBe('OTHER_SESSION')
  })

  it('prefers the enum label over a supplied API label for known types', () => {
    expect(getAppointmentTypeLabel('CONTACT_SESSION', [{ value: 'contact', name: 'Custom contact session' }])).toBe(
      'Contact session',
    )
  })

  it('uses a supplied API label for types without an enum label', () => {
    expect(getAppointmentTypeLabel('NEW_TYPE', [{ value: 'NEW_TYPE', name: 'New type' }])).toBe('New type')
  })
})
