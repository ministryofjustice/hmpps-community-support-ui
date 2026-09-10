import { OffenceSentenceSchema } from './OffenceSentenceFormData'

describe('OffenceSentenceSchema', () => {
  test('rejects when nothing is selected', () => {
    const result = OffenceSentenceSchema.safeParse({
      hasLicenceConditionsOrZones: '',
      licenceConditionsOrZonesDetails: '',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toContain('hasLicenceConditionsOrZones')
    expect(result.error?.issues[0].message).toBe(
      'Select yes if there are any licence conditions or exclusion zones the delivery partner should know about',
    )
  })

  test('accepts no and discards any details when transforming', () => {
    const result = OffenceSentenceSchema.safeParse({
      hasLicenceConditionsOrZones: 'No',
      licenceConditionsOrZonesDetails: 'This should be ignored',
    })

    expect(result).toStrictEqual({
      success: true,
      data: {
        hasLicenceConditionsOrZones: false,
        licenceConditionsOrZonesDetails: null,
      },
    })
  })

  test('rejects when yes is selected without details', () => {
    const result = OffenceSentenceSchema.safeParse({
      hasLicenceConditionsOrZones: 'Yes',
      licenceConditionsOrZonesDetails: '   ',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toContain('licenceConditionsOrZonesDetails')
    expect(result.error?.issues[0].message).toBe('Enter details of all relevant licence conditions or exclusion zones')
  })

  test('accepts yes with details and trims the value', () => {
    const result = OffenceSentenceSchema.safeParse({
      hasLicenceConditionsOrZones: 'Yes',
      licenceConditionsOrZonesDetails: '  No contact with victim  ',
    })

    expect(result).toStrictEqual({
      success: true,
      data: {
        hasLicenceConditionsOrZones: true,
        licenceConditionsOrZonesDetails: 'No contact with victim',
      },
    })
  })
})
