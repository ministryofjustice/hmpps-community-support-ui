import timeFormat, { formatTime12Hr, isoToFormattedTime } from './timeFormat'

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
