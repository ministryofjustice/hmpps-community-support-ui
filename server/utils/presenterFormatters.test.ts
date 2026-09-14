import formatFullName from './presenterFormatters'

describe('presenterFormatters', () => {
  describe('formatFullName', () => {
    it('joins first and last name', () => {
      expect(formatFullName('John', 'Doe')).toBe('John Doe')
    })

    it('includes middle names when provided', () => {
      expect(formatFullName('John', 'Doe', 'Paul')).toBe('John Paul Doe')
    })
  })
})
