import { addDays, addMonths, format, parseISO, startOfDay } from 'date-fns'
import { buildCreateAppointmentFormData } from './ScheduleIcsAppointmentFormData'

describe('Contact session appointment details', () => {
  const today = startOfDay(new Date('2026-06-18'))
  const referralDate = parseISO('2026-06-10')
  const validBody = {
    sessionDate: '20/6/2026',
    'sessionTime-hour': '11',
    'sessionTime-minute': '30',
    'sessionTime-meridiem': 'AM',
    sessionTakePlace: 'ByPhone',
    ByPhone: 'The person cannot attend in person',
    informedMethods: 'informedByPhone',
  }
  const validate = (changes = {}) =>
    buildCreateAppointmentFormData(referralDate, 'CONTACT_SESSION').safeParse({
      ...validBody,
      ...changes,
    })

  beforeEach(() => jest.useFakeTimers().setSystemTime(today))
  afterEach(() => jest.useRealTimers())

  test.each([
    ['ByPhone', 'ByPhone'],
    ['ByVideo', 'ByVideo'],
  ])('%s requires a remote reason', (sessionTakePlace, reasonField) => {
    expect(validate({ sessionTakePlace, [reasonField]: '' }).error?.issues.map(issue => issue.message)).toEqual([
      'Enter the reason the session is not in person',
    ])
    expect(validate({ sessionTakePlace, [reasonField]: 'The person cannot attend in person' }).success).toBe(true)
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
    [{ 'sessionTime-hour': 'zero' }, 'Enter a real start time'],
    [{ 'sessionTime-minute': '60' }, 'Enter a real start time'],
    [{ sessionTakePlace: undefined }, 'Select how the session will take place'],
    [{ sessionTakePlace: 'InProbationOffice', probationOfficeList: '' }, 'Select a probation office'],
    [{ informedMethods: 'informedByOtherMethod', otherMethodOfContact: '' }, 'Enter other contact method'],
  ])('rejects %j with the design error', (changes, message) => {
    const result = validate(changes)
    expect(result.success).toBe(false)
    expect(result.error?.issues.map(issue => issue.message)).toEqual([message])
  })

  test.each([addDays(referralDate, 1), addMonths(today, 6)])('accepts the boundary date %s', date => {
    expect(validate({ sessionDate: format(date, 'd/M/yyyy') }).success).toBe(true)
  })

  test('requires a date after the referral date, while ICS permits the referral date', () => {
    const referralDay = new Date(2026, 5, 10)
    const body = { ...validBody, sessionDate: '10/6/2026' }
    expect(buildCreateAppointmentFormData(referralDay, 'CONTACT_SESSION').safeParse(body).success).toBe(false)
    expect(buildCreateAppointmentFormData(referralDay, 'ICS').safeParse(body).success).toBe(true)
  })

  test.each([
    ['1', '0', 'AM'],
    ['12', '59', 'pm'],
    ['01', '00', 'am'],
  ])('accepts valid 12-hour time %s:%s %s', (hour, minute, meridiem) => {
    expect(
      validate({
        'sessionTime-hour': hour,
        'sessionTime-minute': minute,
        'sessionTime-meridiem': meridiem,
      }).success,
    ).toBe(true)
  })

  test('accepts probation office and all notification methods', () => {
    expect(
      validate({
        sessionTakePlace: 'InProbationOffice',
        probationOfficeList: 'Derby: Derwent Centre',
        informedMethods: ['informedByEmail', 'informedByPhone', 'informedByTextMessage', 'informedByOtherMethod'],
        otherMethodOfContact: 'Letter',
      }).success,
    ).toBe(true)
  })

  test('other session types still require a remote reason', () => {
    expect(
      buildCreateAppointmentFormData(referralDate, 'ICS').safeParse({ ...validBody, ByPhone: undefined }).success,
    ).toBe(false)
  })
})

describe('Contact session address', () => {
  const address = {
    sessionDate: format(addDays(new Date(), 1), 'd/M/yyyy'),
    'sessionTime-hour': '11',
    'sessionTime-minute': '30',
    'sessionTime-meridiem': 'AM',
    sessionTakePlace: 'InSomewhereElse',
    informedMethods: 'informedByPhone',
    addressLine1: '14 High Street',
    addressLine2: '',
    addressTown: 'Bath',
    addressCounty: '',
    addressPostcode: 'BA1 1AA',
  }
  const schema = () => buildCreateAppointmentFormData(new Date('2020-01-01'), 'CONTACT_SESSION')

  test('accepts an inline address without optional fields', () => {
    expect(schema().safeParse(address).success).toBe(true)
  })

  test.each([
    ['addressLine1', '', 'Enter an address line 1'],
    ['addressTown', '', 'Enter a town or city'],
    ['addressPostcode', '', 'Enter a postcode'],
    ['addressPostcode', 'ABCDE', 'Enter a real postcode'],
  ])('validates %s', (field, value, message) => {
    const result = schema().safeParse({ ...address, [field]: value })
    expect(result.error?.issues.map(issue => issue.message)).toEqual([message])
  })
})
