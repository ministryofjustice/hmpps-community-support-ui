import { addDays, addMonths, format, parseISO, startOfDay } from 'date-fns'
import { prisonsData } from '../../integration_tests/mockData/referenceData'
import { buildCreateAppointmentFormData } from './ScheduleIcsAppointmentFormData'

describe('Pre-release session appointment details', () => {
  const today = startOfDay(new Date('2026-06-18'))
  const referralDate = parseISO('2026-06-10')
  const validBody = {
    sessionDate: '20/6/2026',
    'sessionTime-hour': '11',
    'sessionTime-minute': '30',
    'sessionTime-meridiem': 'AM',
    sessionTakePlace: 'InPrison',
    prisonList: prisonsData[0].agencyId,
  }
  const validate = (changes = {}) =>
    buildCreateAppointmentFormData(referralDate, 'PRE_RELEASE_SESSION', prisonsData).safeParse({
      ...validBody,
      ...changes,
    })

  beforeEach(() => jest.useFakeTimers().setSystemTime(today))
  afterEach(() => jest.useRealTimers())

  test('accepts a selected prison without informed-by or meet-at-the-gate answers', () => {
    expect(validate().success).toBe(true)
  })

  test.each([
    [{ sessionDate: '' }, 'Enter a session date'],
    [{ sessionDate: '30/2/2026' }, 'Enter a date in the correct format, like 10/7/2025'],
    [{ sessionDate: '20-6-2026' }, 'Enter a date in the correct format, like 10/7/2025'],
    [{ sessionDate: '9/6/2026' }, 'Session date must be after the referral date'],
    [{ sessionDate: '10/6/2026' }, 'Session date must be after the referral date'],
    [{ sessionDate: '19/12/2026' }, 'Session date must not be more than 6 months in the future'],
    [{ 'sessionTime-hour': '', 'sessionTime-minute': '', 'sessionTime-meridiem': '' }, 'Enter a start time'],
    [{ 'sessionTime-hour': '' }, 'Start time must include hours'],
    [{ 'sessionTime-minute': '' }, 'Start time must include minutes'],
    [{ 'sessionTime-meridiem': '' }, 'Select am or pm'],
    [{ 'sessionTime-meridiem': 'invalid' }, 'Select am or pm'],
    [{ 'sessionTime-hour': '13' }, 'Enter a real start time'],
    [{ 'sessionTime-minute': '60' }, 'Enter a real start time'],
    [{ sessionTakePlace: undefined }, 'Select how the session will take place'],
    [{ prisonList: '' }, 'Select a prison'],
    [{ prisonList: '   ' }, 'Select a prison'],
    [{ prisonList: 'UNKNOWN' }, 'Select a prison'],
  ])('rejects %j with the design error', (changes, message) => {
    const result = validate(changes)
    expect(result.success).toBe(false)
    expect(result.error?.issues.map(issue => issue.message)).toEqual([message])
  })

  test.each([addDays(referralDate, 1), addMonths(today, 6)])('accepts the boundary date %s', date => {
    expect(validate({ sessionDate: format(date, 'd/M/yyyy') }).success).toBe(true)
  })

  test.each([
    ['ByPhone', 'ByPhone'],
    ['ByVideo', 'ByVideo'],
  ])('%s requires a reason and does not require a prison', (sessionTakePlace, reasonField) => {
    for (const reason of ['', '   ']) {
      expect(validate({ sessionTakePlace, [reasonField]: reason }).error?.issues.map(issue => issue.message)).toEqual([
        'Enter the reason the session is not in person',
      ])
    }
    expect(validate({ sessionTakePlace, [reasonField]: 'The person cannot attend in person' }).success).toBe(true)
  })

  test.each(['InProbationOffice', 'InSomewhereElse', 'InPerson'])('rejects the unavailable method %s', method => {
    expect(validate({ sessionTakePlace: method }).error?.issues.map(issue => issue.message)).toEqual([
      'Select how the session will take place',
    ])
  })

  test('rejects a prison that is no longer active', () => {
    const inactivePrison = { ...prisonsData[0], active: false }
    const result = buildCreateAppointmentFormData(referralDate, 'PRE_RELEASE_SESSION', [inactivePrison]).safeParse(
      validBody,
    )
    expect(result.error?.issues.map(issue => issue.message)).toEqual(['Select a prison'])
  })
})
