import { buildIcsSummaryRows, formatAddress, IcsSummaryRowsInput } from './icsDetailsSummaryBuilder'

const baseInput: IcsSummaryRowsInput = {
  formattedDate: '15 June 2026',
  formattedTime: '1:00pm',
  methodDisplay: 'Phone call',
  personFirstName: 'Alice',
  communicationsDisplay: 'Phone call, Text message',
}

describe('buildIcsSummaryRows', () => {
  it('should always include Date, Start time and Method rows', () => {
    const rows = buildIcsSummaryRows(baseInput)

    expect(rows[0]).toEqual({ key: { text: 'Date' }, value: { text: '15 June 2026' } })
    expect(rows[1]).toEqual({ key: { text: 'Start time' }, value: { text: '1:00pm' } })
    expect(rows[2]).toEqual({ key: { text: 'Method' }, value: { text: 'Phone call' } })
  })

  it('should always include the person communication row as the last row', () => {
    const rows = buildIcsSummaryRows(baseInput)

    expect(rows.at(-1)).toEqual({
      key: { text: 'How Alice was informed about the session' },
      value: { text: 'Phone call, Text message' },
    })
  })

  it('should include the reason row when reason is provided', () => {
    const rows = buildIcsSummaryRows({ ...baseInput, reason: 'Client has no transport.' })

    const reasonRow = rows.find(r => r.key.text === 'Reason session is not in-person')
    expect(reasonRow).toEqual({
      key: { text: 'Reason session is not in-person' },
      value: { text: 'Client has no transport.' },
    })
  })

  it('should not include the reason row when reason is null', () => {
    const rows = buildIcsSummaryRows({ ...baseInput, reason: null })

    const reasonRow = rows.find(r => r.key.text === 'Reason session is not in-person')
    expect(reasonRow).toBeUndefined()
  })

  it('should not include the reason row when reason is undefined', () => {
    const rows = buildIcsSummaryRows({ ...baseInput })

    const reasonRow = rows.find(r => r.key.text === 'Reason session is not in-person')
    expect(reasonRow).toBeUndefined()
  })

  it('should include the location row with text value when locationValue is a text object', () => {
    const rows = buildIcsSummaryRows({ ...baseInput, locationValue: { text: 'Probation office' } })

    const locationRow = rows.find(r => r.key.text === 'Location')
    expect(locationRow).toEqual({ key: { text: 'Location' }, value: { text: 'Probation office' } })
  })

  it('should include the location row with html value when locationValue is an html object', () => {
    const rows = buildIcsSummaryRows({ ...baseInput, locationValue: { html: '123 Main St<br>Leeds<br>LS1 1AA' } })

    const locationRow = rows.find(r => r.key.text === 'Location')
    expect(locationRow).toEqual({ key: { text: 'Location' }, value: { html: '123 Main St<br>Leeds<br>LS1 1AA' } })
  })

  it('should not include the location row when locationValue is undefined', () => {
    const rows = buildIcsSummaryRows({ ...baseInput })

    const locationRow = rows.find(r => r.key.text === 'Location')
    expect(locationRow).toBeUndefined()
  })

  it('should produce 4 rows for a virtual session without reason', () => {
    const rows = buildIcsSummaryRows({ ...baseInput })
    expect(rows).toHaveLength(4)
  })

  it('should produce 5 rows for a virtual session with reason', () => {
    const rows = buildIcsSummaryRows({ ...baseInput, reason: 'No vehicle' })
    expect(rows).toHaveLength(5)
  })

  it('should produce 5 rows for an in-person session with location', () => {
    const rows = buildIcsSummaryRows({ ...baseInput, locationValue: { text: 'Probation office' } })
    expect(rows).toHaveLength(5)
  })

  it('should produce 6 rows for a virtual session with both reason and location', () => {
    const rows = buildIcsSummaryRows({
      ...baseInput,
      reason: 'No vehicle',
      locationValue: { text: 'Other location' },
    })
    expect(rows).toHaveLength(6)
  })
})

describe('formatAddress', () => {
  it('should join all address parts with <br>', () => {
    const result = formatAddress({
      addressLine1: '123 Main Street',
      addressLine2: 'Flat 4',
      townOrCity: 'Leeds',
      county: 'West Yorkshire',
      postcode: 'LS1 1AA',
    })
    expect(result).toBe('123 Main Street<br>Flat 4<br>Leeds<br>West Yorkshire<br>LS1 1AA')
  })

  it('should filter out null values', () => {
    const result = formatAddress({
      addressLine1: '123 Main Street',
      addressLine2: null,
      townOrCity: 'Leeds',
      county: null,
      postcode: 'LS1 1AA',
    })
    expect(result).toBe('123 Main Street<br>Leeds<br>LS1 1AA')
  })

  it('should filter out undefined values', () => {
    const result = formatAddress({
      addressLine1: '123 Main Street',
      townOrCity: 'Leeds',
      postcode: 'LS1 1AA',
    })
    expect(result).toBe('123 Main Street<br>Leeds<br>LS1 1AA')
  })

  it('should return an empty string when all parts are null or undefined', () => {
    const result = formatAddress({ addressLine1: null, addressLine2: null })
    expect(result).toBe('')
  })

  it('should return a single value when only one part is provided', () => {
    const result = formatAddress({ postcode: 'LS1 1AA' })
    expect(result).toBe('LS1 1AA')
  })
})
