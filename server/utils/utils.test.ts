import { buildInput, convertToTitleCase, initialiseName, trimOrDefault } from './utils'

describe('convert to title case', () => {
  it.each([
    [null, null, ''],
    ['empty string', '', ''],
    ['Lower case', 'robert', 'Robert'],
    ['Upper case', 'ROBERT', 'Robert'],
    ['Mixed case', 'RoBErT', 'Robert'],
    ['Multiple words', 'RobeRT SMiTH', 'Robert Smith'],
    ['Leading spaces', '  RobeRT', '  Robert'],
    ['Trailing spaces', 'RobeRT  ', 'Robert  '],
    ['Hyphenated', 'Robert-John SmiTH-jONes-WILSON', 'Robert-John Smith-Jones-Wilson'],
  ])('%s convertToTitleCase(%s, %s)', (_: string, a: string, expected: string) => {
    expect(convertToTitleCase(a)).toEqual(expected)
  })
})

describe('initialise name', () => {
  it.each([
    [null, null, null],
    ['Empty string', '', null],
    ['One word', 'robert', 'r. robert'],
    ['Two words', 'Robert James', 'R. James'],
    ['Three words', 'Robert James Smith', 'R. Smith'],
    ['Double barrelled', 'Robert-John Smith-Jones-Wilson', 'R. Smith-Jones-Wilson'],
  ])('%s initialiseName(%s, %s)', (_: string, a: string, expected: string) => {
    expect(initialiseName(a)).toEqual(expected)
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

describe('buildInput', () => {
  it('does not add error styling when there is no error', () => {
    const html = buildInput({ id: 'reason', name: 'reason', label: { text: 'Reason' } })
    expect(html).toContain('class="govuk-form-group"')
    expect(html).toContain('class="govuk-input"')
    expect(html).not.toContain('--error')
  })

  it('adds error styling and links the error message when there is an error', () => {
    const html = buildInput({
      id: 'reason',
      name: 'reason',
      label: { text: 'Reason' },
      errorMessage: { text: 'Enter the reason the session is not in person' },
    })
    expect(html).toContain('class="govuk-form-group govuk-form-group--error"')
    expect(html).toContain('class="govuk-input govuk-input--error"')
    expect(html).toContain('aria-describedby="reason-error"')
    expect(html).toContain('<p id="reason-error" class="govuk-error-message">')
  })
})
