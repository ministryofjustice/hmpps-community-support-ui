import { ActionPlanSessionDeliveryDetailsResponse } from '@community-support-api'
import { ActionPlanServiceEndDateCheckFormDataSchemaBuilder } from './ActionPlanServiceEndDateCheckFormData'

const sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse = {
  questions: [
    {
      id: '11111111-1111-1111-1111-111111111111',
      displayOrder: 1,
      label: 'Does the service still need to be completed by this date?',
      key: 'SERVICE_END_DATE_CHECK',
      answerType: 'RADIO',
      maximumNumberOfResponses: 1,
      choices: [
        { value: 'YES', label: 'Yes', displayOrder: 1, displayAdditionalDetailsOnSelect: false },
        { value: 'NO', label: 'No', displayOrder: 2, displayAdditionalDetailsOnSelect: false },
      ],
      savedResponses: [],
    },
  ],
}

describe('ActionPlanServiceEndDateCheckFormDataSchemaBuilder', () => {
  const endDate = '24 May 2026'
  const schema = ActionPlanServiceEndDateCheckFormDataSchemaBuilder(sessionDeliveryDetails, endDate)

  it('accepts a valid SERVICE_END_DATE_CHECK value', () => {
    const result = schema.safeParse({ SERVICE_END_DATE_CHECK: 'YES' })

    expect(result.success).toBe(true)
  })

  it('accepts the other valid SERVICE_END_DATE_CHECK value', () => {
    const result = schema.safeParse({ SERVICE_END_DATE_CHECK: 'NO' })

    expect(result.success).toBe(true)
  })

  it('rejects an empty SERVICE_END_DATE_CHECK value', () => {
    const result = schema.safeParse({ SERVICE_END_DATE_CHECK: '' })

    expect(result.success).toBe(false)
    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ['SERVICE_END_DATE_CHECK'],
          message: `Select yes if the service end date is still ${endDate}`,
        }),
      ]),
    )
  })

  it('rejects a missing SERVICE_END_DATE_CHECK value', () => {
    const result = schema.safeParse({})

    expect(result.success).toBe(false)
    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ['SERVICE_END_DATE_CHECK'],
          message: `Select yes if the service end date is still ${endDate}`,
        }),
      ]),
    )
  })

  it('rejects a SERVICE_END_DATE_CHECK value that is not one of the fetched choices', () => {
    const result = schema.safeParse({ SERVICE_END_DATE_CHECK: 'HACKED_VALUE' })

    expect(result.success).toBe(false)
    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ['SERVICE_END_DATE_CHECK'],
          message: `Select yes if the service end date is still ${endDate}`,
        }),
      ]),
    )
  })

  it('includes the supplied end date in the error message', () => {
    const otherEndDate = '1 January 2027'
    const schemaWithOtherEndDate = ActionPlanServiceEndDateCheckFormDataSchemaBuilder(
      sessionDeliveryDetails,
      otherEndDate,
    )

    const result = schemaWithOtherEndDate.safeParse({ SERVICE_END_DATE_CHECK: '' })

    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ['SERVICE_END_DATE_CHECK'],
          message: `Select yes if the service end date is still ${otherEndDate}`,
        }),
      ]),
    )
  })
})
