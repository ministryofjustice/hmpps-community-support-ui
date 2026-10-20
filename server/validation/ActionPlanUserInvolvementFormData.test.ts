import { ActionPlanSessionDeliveryDetailsResponse } from '@community-support-api'
import {
  ActionPlanUserInvolvementFormDataSchemaBuilder,
  UserInvolvementSchema,
} from './ActionPlanUserInvolvementFormData'

const sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse = {
  questions: [
    {
      id: '11111111-1111-1111-1111-111111111111',
      displayOrder: 1,
      label: 'Was the person involved in creating the action plan?',
      key: 'USER_INVOLVEMENT_IN_ACTION_PLAN',
      answerType: 'RADIO',
      maximumNumberOfResponses: 1,
      choices: [
        { value: 'YES', label: 'Yes', displayOrder: 1, displayAdditionalDetailsOnSelect: false },
        { value: 'NO', label: 'No', displayOrder: 2, displayAdditionalDetailsOnSelect: true },
      ],
      savedResponses: [],
    },
  ],
}

describe('ActionPlanUserInvolvementFormDataSchemaBuilder', () => {
  const firstName = 'Alex'
  const nothingSelectedMessage = `Select yes if ${firstName} was involved in creating the action plan`
  const nothingEnteredMessage = `Enter details about why ${firstName} was not involved in creating the action plan`
  const maxCharMessage = `Details about why ${firstName} was not involved in creating the action plan must be 65000 characters or less`
  const schema = ActionPlanUserInvolvementFormDataSchemaBuilder(sessionDeliveryDetails, firstName)

  it('accepts YES without any details', () => {
    const result = schema.safeParse({ USER_INVOLVEMENT_IN_ACTION_PLAN: 'YES' })

    expect(result.success).toBe(true)
  })

  it('accepts NO when details are provided', () => {
    const result = schema.safeParse({
      USER_INVOLVEMENT_IN_ACTION_PLAN: 'NO',
      WHY_NOT_INVOLVED: 'They were unavailable',
    })

    expect(result.success).toBe(true)
  })

  it('does not require details when YES is selected', () => {
    const result = schema.safeParse({ USER_INVOLVEMENT_IN_ACTION_PLAN: 'YES', WHY_NOT_INVOLVED: '' })

    expect(result.success).toBe(true)
  })

  it.each([undefined, '', '   '])('rejects a missing or blank selection (%j)', value => {
    const result = schema.safeParse({ USER_INVOLVEMENT_IN_ACTION_PLAN: value })

    expect(result.success).toBe(false)
    expect(result.error?.issues).toEqual([
      expect.objectContaining({ path: ['USER_INVOLVEMENT_IN_ACTION_PLAN'], message: nothingSelectedMessage }),
    ])
  })

  it('rejects a value that is not one of the fetched choices', () => {
    const result = schema.safeParse({ USER_INVOLVEMENT_IN_ACTION_PLAN: 'MAYBE' })

    expect(result.success).toBe(false)
    expect(result.error?.issues).toEqual([
      expect.objectContaining({ path: ['USER_INVOLVEMENT_IN_ACTION_PLAN'], message: nothingSelectedMessage }),
    ])
  })

  it('rejects every selection when the question has no fetched choices', () => {
    const result = ActionPlanUserInvolvementFormDataSchemaBuilder({ questions: [] }, firstName).safeParse({
      USER_INVOLVEMENT_IN_ACTION_PLAN: 'YES',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]).toMatchObject({
      path: ['USER_INVOLVEMENT_IN_ACTION_PLAN'],
      message: nothingSelectedMessage,
    })
  })

  it.each([undefined, '', '   '])('rejects NO without details (%j)', details => {
    const result = schema.safeParse({ USER_INVOLVEMENT_IN_ACTION_PLAN: 'NO', WHY_NOT_INVOLVED: details })

    expect(result.success).toBe(false)
    expect(result.error?.issues).toEqual([
      expect.objectContaining({ path: ['WHY_NOT_INVOLVED'], message: nothingEnteredMessage }),
    ])
  })

  it('accepts details of exactly 65000 characters', () => {
    const result = schema.safeParse({ USER_INVOLVEMENT_IN_ACTION_PLAN: 'NO', WHY_NOT_INVOLVED: 'a'.repeat(65000) })

    expect(result.success).toBe(true)
  })

  it('rejects details of more than 65000 characters', () => {
    const result = schema.safeParse({ USER_INVOLVEMENT_IN_ACTION_PLAN: 'NO', WHY_NOT_INVOLVED: 'a'.repeat(65001) })

    expect(result.success).toBe(false)
    expect(result.error?.issues).toEqual([
      expect.objectContaining({ path: ['WHY_NOT_INVOLVED'], message: maxCharMessage }),
    ])
  })

  it('rejects details of more than 65000 characters even when YES is selected', () => {
    const result = schema.safeParse({ USER_INVOLVEMENT_IN_ACTION_PLAN: 'YES', WHY_NOT_INVOLVED: 'a'.repeat(65001) })

    expect(result.success).toBe(false)
    expect(result.error?.issues).toEqual([
      expect.objectContaining({ path: ['WHY_NOT_INVOLVED'], message: maxCharMessage }),
    ])
  })

  it('exports a default schema built without any questions', () => {
    expect(UserInvolvementSchema.safeParse({ USER_INVOLVEMENT_IN_ACTION_PLAN: 'YES' }).success).toBe(false)
  })
})
