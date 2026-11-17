import { fromApiInformedBy, toApiInformedBy } from './informedByLabels'

describe('toApiInformedBy', () => {
  it('maps checkbox keys to the values the API stores', () => {
    expect(toApiInformedBy(['informedByPhone', 'informedByEmail', 'informedByTextMessage'])).toEqual([
      'Phone',
      'Email',
      'Text message',
    ])
  })

  it('passes free-text other methods through unchanged', () => {
    expect(toApiInformedBy(['informedByEmail', 'Carrier pigeon'])).toEqual(['Email', 'Carrier pigeon'])
  })

  it('keeps typed text even when it matches the other-method checkbox value', () => {
    expect(toApiInformedBy(['informedByEmail', 'informedByOtherMethod'])).toEqual(['Email', 'informedByOtherMethod'])
  })

  it('returns an empty list when nothing is selected', () => {
    expect(toApiInformedBy(undefined)).toEqual([])
    expect(toApiInformedBy([])).toEqual([])
  })
})

describe('fromApiInformedBy', () => {
  it('maps stored API values back to checkbox keys', () => {
    expect(fromApiInformedBy(['Phone', 'Email', 'Text message'])).toEqual([
      'informedByPhone',
      'informedByEmail',
      'informedByTextMessage',
    ])
  })

  it('leaves free-text other methods unchanged', () => {
    expect(fromApiInformedBy(['Email', 'Carrier pigeon'])).toEqual(['informedByEmail', 'Carrier pigeon'])
  })
})
