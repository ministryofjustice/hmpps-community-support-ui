import { formatFullName, formatTime12Hr, trimOrDefault } from './presenterFormatters'

describe('presenterFormatters', () => {
  describe('formatFullName', () => {
    it('joins first and last name', () => {
      expect(formatFullName('John', 'Doe')).toBe('John Doe')
    })

    it('includes middle names when provided', () => {
      expect(formatFullName('John', 'Doe', 'Paul')).toBe('John Paul Doe')
    })
  })

  describe('trimOrDefault', () => {
    it('returns a trimmed value when present', () => {
      expect(trimOrDefault('  hello  ', 'Not available')).toBe('hello')
    })

    it('returns default when value is empty', () => {
      expect(trimOrDefault('   ', 'Not available')).toBe('Not available')
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
})
