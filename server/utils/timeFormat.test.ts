import timeFormat, { formatTime12Hr, isoToFormattedTime, parseTime12Hr } from './timeFormat'

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
