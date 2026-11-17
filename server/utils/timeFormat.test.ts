import timeFormat, { formatTime12Hr, formatTime24Hr, isoToFormattedTime, parseTime12Hr } from './timeFormat'

describe('formatTime24Hr', () => {
  it.each([
    [{ hour: 4, minute: 59, amPm: 'pm' }, '16:59'],
    [{ hour: 12, minute: 0, amPm: 'am' }, '00:00'],
    [{ hour: 12, minute: 30, amPm: 'am' }, '00:30'],
    [{ hour: 12, minute: 0, amPm: 'pm' }, '12:00'],
    [{ hour: 12, minute: 30, amPm: 'pm' }, '12:30'],
    [{ hour: 1, minute: 5, amPm: 'am' }, '01:05'],
    [{ hour: 11, minute: 59, amPm: 'pm' }, '23:59'],
    [{ hour: 4, minute: 59, amPm: 'PM' }, '16:59'],
    [{ hour: 12, minute: 0, amPm: 'AM' }, '00:00'],
  ])('converts %j to %s', (time, expected) => {
    expect(formatTime24Hr(time)).toBe(expected)
  })

  it('produces strings that sort in chronological order', () => {
    const times = [
      { hour: 4, minute: 59, amPm: 'pm' },
      { hour: 12, minute: 0, amPm: 'pm' },
      { hour: 9, minute: 5, amPm: 'am' },
      { hour: 12, minute: 0, amPm: 'am' },
      { hour: 4, minute: 5, amPm: 'pm' },
      { hour: 11, minute: 59, amPm: 'pm' },
    ]

    expect(times.map(formatTime24Hr).sort()).toEqual(['00:00', '09:05', '12:00', '16:05', '16:59', '23:59'])
  })
})

describe('timeFormat', () => {
  it('formats a provided time object', () => {
    expect(timeFormat({ hour: 13, minute: 5, amPm: 'pm' })).toBe('1:05pm')
  })
})

describe('isoToFormattedTime', () => {
  it('formats an ISO string to display time', () => {
    const iso = '2026-09-10T13:30:00.000Z'
    const date = new Date(iso)
    const expected = `${date.getHours() % 12 || 12}:${String(date.getMinutes()).padStart(2, '0')}${
      date.getHours() >= 12 ? 'pm' : 'am'
    }`

    expect(isoToFormattedTime(iso)).toBe(expected)
  })
})

describe('formatTime12Hr', () => {
  it('formats a normal pm value in existing style', () => {
    expect(formatTime12Hr(1, 0, 'PM')).toBe('1:00pm')
  })

  it('defaults minute to 00 when missing', () => {
    expect(formatTime12Hr(9, undefined, 'am')).toBe('9:00am')
  })

  it('keeps existing behaviour for amPm spacing', () => {
    expect(formatTime12Hr(9, 0, 'am ')).toBe('9:00am ')
  })
})

describe('parseTime12Hr', () => {
  it('parses a standard 12-hour time string into the API format', () => {
    expect(parseTime12Hr('1:30pm')).toEqual({ hour: 1, minute: 30, amPm: 'pm' })
    expect(parseTime12Hr('9am')).toEqual({ hour: 9, minute: 0, amPm: 'am' })
    expect(parseTime12Hr('12:45pm')).toEqual({ hour: 12, minute: 45, amPm: 'pm' })
  })

  it('defaults to a safe fallback when the value is missing or invalid', () => {
    expect(parseTime12Hr()).toEqual({ hour: 0, minute: 0, amPm: 'am' })
    expect(parseTime12Hr('not-a-time')).toEqual({ hour: 0, minute: 0, amPm: 'am' })
  })
})
