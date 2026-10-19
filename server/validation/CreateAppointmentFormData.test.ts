import { startOfDay } from 'date-fns'
import { buildCreateAppointmentFormData } from './ScheduleIcsAppointmentFormData'
import { parseAppointmentType } from '../appointment/appointmentTypeRules'

describe('buildCreateAppointmentFormData', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(startOfDay(new Date('2026-06-18')))
  })

  const base = {
    sessionDate: '20/6/2026',
    'sessionTime-hour': '11',
    'sessionTime-minute': '30',
    'sessionTime-meridiem': 'am',
  }
  const referralDate = new Date('2026-06-01')

  test('handover session accepts in-person without informed methods or location', () => {
    const schema = buildCreateAppointmentFormData(referralDate, 'HANDOVER_SESSION')
    expect(schema.safeParse({ ...base, sessionTakePlace: 'InPerson' }).success).toBe(true)
  })

  test('handover session rejects somewhere else', () => {
    const schema = buildCreateAppointmentFormData(referralDate, 'HANDOVER_SESSION')
    expect(schema.safeParse({ ...base, sessionTakePlace: 'InProbationOffice', probationOfficeList: 'x' }).success).toBe(
      false,
    )
  })

  test('post-release session requires meet at the gate', () => {
    const schema = buildCreateAppointmentFormData(referralDate, 'POST_RELEASE_SESSION')
    const body = { ...base, sessionTakePlace: 'ByPhone', ByPhone: 'reason', informedMethods: 'informedByPhone' }
    expect(schema.safeParse(body).success).toBe(false)
    expect(schema.safeParse({ ...body, meetAtTheGate: 'yes' }).success).toBe(true)
  })

  test('contact session does not require meet at the gate but requires informed methods', () => {
    const schema = buildCreateAppointmentFormData(referralDate, 'CONTACT_SESSION')
    const body = { ...base, sessionTakePlace: 'ByVideo', ByVideo: 'reason' }
    expect(schema.safeParse(body).success).toBe(false)
    expect(schema.safeParse({ ...body, informedMethods: 'informedByEmail' }).success).toBe(true)
  })

  test('pre-release session rejects probation office', () => {
    const schema = buildCreateAppointmentFormData(referralDate, 'PRE_RELEASE_SESSION')
    const body = {
      ...base,
      sessionTakePlace: 'InProbationOffice',
      probationOfficeList: 'x',
      informedMethods: 'informedByEmail',
    }
    expect(schema.safeParse(body).success).toBe(false)
  })
})

describe('parseAppointmentType', () => {
  test.each([
    ['contact-session', 'CONTACT_SESSION'],
    ['POST_RELEASE_SESSION', 'POST_RELEASE_SESSION'],
    ['pre-release-session', 'PRE_RELEASE_SESSION'],
    ['Handover_Session', 'HANDOVER_SESSION'],
  ])('%s', (input, expected) => {
    expect(parseAppointmentType(input)).toBe(expected)
  })

  test.each(['ICS', 'nonsense', undefined, 5])('rejects %s', input => {
    expect(parseAppointmentType(input)).toBeUndefined()
  })
})
