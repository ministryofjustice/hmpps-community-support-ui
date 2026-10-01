import { ActionPlanSessionDeliveryDetailsResponse } from '@community-support-api'
import { ActionPlanRisksAndAdjustmentsFormDataSchemaBuilder } from './ActionPlanRisksAndAdjustmentsFormData'

const sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse = {
  questions: [
    {
      id: '11111111-1111-1111-1111-111111111111',
      displayOrder: 1,
      label: 'Is there a risk associated with the planned activities?',
      key: 'RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES',
      answerType: 'RADIO',
      maximumNumberOfResponses: 1,
      choices: [
        { value: 'YES', label: 'Yes', displayOrder: 1, displayAdditionalDetailsOnSelect: true },
        { value: 'NO', label: 'No', displayOrder: 2, displayAdditionalDetailsOnSelect: false },
      ],
      savedResponses: [],
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      displayOrder: 2,
      label: 'Will you put reasonable adjustments in place?',
      key: 'REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES',
      answerType: 'RADIO',
      maximumNumberOfResponses: 1,
      choices: [
        { value: 'YES', label: 'Yes', displayOrder: 1, displayAdditionalDetailsOnSelect: true },
        { value: 'NO', label: 'No', displayOrder: 2, displayAdditionalDetailsOnSelect: false },
      ],
      savedResponses: [],
    },
  ],
}

describe('ActionPlanRisksAndAdjustmentsFormDataSchemaBuilder', () => {
  const firstName = 'Alex'
  const schema = ActionPlanRisksAndAdjustmentsFormDataSchemaBuilder(sessionDeliveryDetails, firstName)

  it('accepts valid data when neither risks nor adjustments apply', () => {
    const result = schema.safeParse({
      RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES: 'NO',
      REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES: 'NO',
    })

    expect(result.success).toBe(true)
  })

  it('rejects empty RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES and REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES values', () => {
    const result = schema.safeParse({
      RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES: '',
      REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES: '',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ['RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES'],
          message: 'Select yes if there are any risks associated with the planned activities',
        }),
        expect.objectContaining({
          path: ['REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES'],
          message: `Select yes if you will put any reasonable adjustments in place to help ${firstName} take part in the planned activities`,
        }),
      ]),
    )
  })

  it('rejects a RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES value that is not one of the fetched choices', () => {
    const result = schema.safeParse({
      RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES: 'HACKED_VALUE',
      REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES: 'NO',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ['RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES'],
          message: 'Select yes if there are any risks associated with the planned activities',
        }),
      ]),
    )
  })

  it('rejects a REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES value that is not one of the fetched choices', () => {
    const result = schema.safeParse({
      RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES: 'NO',
      REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES: 'HACKED_VALUE',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ['REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES'],
          message: `Select yes if you will put any reasonable adjustments in place to help ${firstName} take part in the planned activities`,
        }),
      ]),
    )
  })

  it('requires RISK_INFO when RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES is YES', () => {
    const result = schema.safeParse({
      RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES: 'YES',
      REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES: 'NO',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ['RISK_INFO'],
          message: 'Enter details about the risks and what you will put in place to reduce them',
        }),
      ]),
    )
  })

  it('accepts RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES as YES when RISK_INFO is provided', () => {
    const result = schema.safeParse({
      RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES: 'YES',
      RISK_INFO: 'There is a risk of harm to staff',
      REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES: 'NO',
    })

    expect(result.success).toBe(true)
  })

  it('requires ADJUSTMENT_INFO when REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES is YES', () => {
    const result = schema.safeParse({
      RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES: 'NO',
      REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES: 'YES',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ['ADJUSTMENT_INFO'],
          message: 'Enter details about what adjustments you will make',
        }),
      ]),
    )
  })

  it('accepts REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES as YES when ADJUSTMENT_INFO is provided', () => {
    const result = schema.safeParse({
      RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES: 'NO',
      REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES: 'YES',
      ADJUSTMENT_INFO: 'Provide a hearing loop',
    })

    expect(result.success).toBe(true)
  })

  it('requires both RISK_INFO and ADJUSTMENT_INFO when both questions are answered YES', () => {
    const result = schema.safeParse({
      RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES: 'YES',
      REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES: 'YES',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: ['RISK_INFO'] }),
        expect.objectContaining({ path: ['ADJUSTMENT_INFO'] }),
      ]),
    )
  })
})
