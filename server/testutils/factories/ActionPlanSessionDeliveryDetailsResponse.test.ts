import type { ActionPlanSessionDeliveryDetailsResponse } from '@community-support-api'
import {
  actionPlanSessionDeliveryDetailsFactory,
  actionPlanRisksAndAdjustmentsFactory,
  actionPlanPersonInvolvementFactory,
  actionPlanUpdateServiceEndDateFactory,
} from './ActionPlanSessionDeliveryDetailsResponse'

type SavedResponses = ActionPlanSessionDeliveryDetailsResponse['questions'][number]['savedResponses']

describe('action plan service delivery response factories', () => {
  describe('service end date defaults', () => {
    afterEach(() => {
      jest.useRealTimers()
    })

    it('defaults to ten calendar days after the build date', () => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date(2026, 9, 25, 12))

      expect(actionPlanUpdateServiceEndDateFactory.build().questions[0].savedResponses).toEqual([
        { value: '2026-11-04', additionalDetails: null },
      ])

      jest.setSystemTime(new Date(2026, 11, 25, 12))

      expect(actionPlanUpdateServiceEndDateFactory.build().questions[0].savedResponses).toEqual([
        { value: '2027-01-04', additionalDetails: null },
      ])
    })

    it('preserves an explicit date override', () => {
      const response = actionPlanUpdateServiceEndDateFactory.build(
        {},
        { transient: { newServiceEndDate: '2027-02-15' } },
      )

      expect(response.questions[0].savedResponses).toEqual([{ value: '2027-02-15', additionalDetails: null }])
    })

    it('preserves an explicitly empty date', () => {
      const response = actionPlanUpdateServiceEndDateFactory.build({}, { transient: { newServiceEndDate: null } })

      expect(response.questions[0].savedResponses).toEqual([])
    })
  })

  it.each([
    {
      factory: actionPlanSessionDeliveryDetailsFactory,
      keys: ['SESSION_FREQUENCY', 'SESSION_DELIVERY_METHOD', 'SESSION_FORMAT'],
      answers: [
        [{ value: 'Every week', additionalDetails: null }],
        [{ value: 'VIDEO_CALL', additionalDetails: 'Travel restrictions' }],
        [{ value: 'GROUP_SESSION', additionalDetails: null }],
      ],
    },
    {
      factory: actionPlanRisksAndAdjustmentsFactory,
      keys: ['RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES', 'REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES'],
      answers: [
        [{ value: 'YES', additionalDetails: 'Risk of harm to staff' }],
        [{ value: 'YES', additionalDetails: 'Step-free access' }],
      ],
    },
    {
      factory: actionPlanPersonInvolvementFactory,
      keys: ['USER_INVOLVEMENT_IN_ACTION_PLAN'],
      answers: [[{ value: 'NO', additionalDetails: 'User was sick' }]],
    },
  ])('builds fresh questions and default answers for $keys', ({ factory, keys, answers }) => {
    const response = factory.build()
    const anotherResponse = factory.build()

    expect(response.questions.map(question => question.key)).toEqual(keys)
    expect(response.questions.map(question => question.savedResponses)).toEqual(answers)
    response.questions.forEach((question, index) => {
      expect(question.id).not.toEqual(anotherResponse.questions[index].id)
      expect(question.savedResponses).not.toBe(anotherResponse.questions[index].savedResponses)
    })
  })

  it('supports custom session answers, additional details and multiple formats', () => {
    const answers: Record<'sessionFrequency' | 'sessionDeliveryMethod' | 'sessionFormat', SavedResponses> = {
      sessionFrequency: [{ value: 'Every month', additionalDetails: null }],
      sessionDeliveryMethod: [{ value: 'PHONE_CALL', additionalDetails: 'Lives far away' }],
      sessionFormat: [
        { value: 'ONE_TO_ONE_SESSION', additionalDetails: null },
        { value: 'GROUP_SESSION', additionalDetails: null },
      ],
    }

    const response = actionPlanSessionDeliveryDetailsFactory.build({}, { transient: answers })

    expect(response.questions.map(question => question.savedResponses)).toEqual(Object.values(answers))
  })

  it('supports custom risk and adjustment answers and person name', () => {
    const risks: SavedResponses = [{ value: 'NO', additionalDetails: null }]
    const reasonableAdjustments: SavedResponses = [{ value: 'YES', additionalDetails: 'Step-free access' }]
    const response = actionPlanRisksAndAdjustmentsFactory.build(
      {},
      { transient: { firstName: 'Sam', risks, reasonableAdjustments } },
    )

    expect(response.questions.map(question => question.savedResponses)).toEqual([risks, reasonableAdjustments])
    expect(response.questions[1].label).toContain('Sam')
    expect(response.questions[1].choices[0].additionalDetailsLabel).toContain('Sam')
    expect(response.questions[1].choices[0].additionalDetailsHint).toContain('Sam')
  })

  it('supports a saved NO answer and a custom person name for involvement', () => {
    const savedResponses = [{ value: 'NO', additionalDetails: 'They were unavailable' }]
    const response = actionPlanPersonInvolvementFactory.build({}, { transient: { firstName: 'Sam', savedResponses } })

    expect(response.questions[0].savedResponses).toEqual(savedResponses)
    expect(response.questions[0].label).toBe('Was Sam involved in creating the action plan?')
    expect(response.questions[0].choices[1]).toMatchObject({
      value: 'NO',
      displayAdditionalDetailsOnSelect: true,
      additionalDetailsLabel: 'Why was Sam not involved?',
    })
  })

  it('supports unanswered questions without replacing empty answers with defaults', () => {
    const responses = [
      actionPlanSessionDeliveryDetailsFactory.build(
        {},
        { transient: { sessionFrequency: [], sessionDeliveryMethod: [], sessionFormat: [] } },
      ),
      actionPlanRisksAndAdjustmentsFactory.build({}, { transient: { risks: [], reasonableAdjustments: [] } }),
      actionPlanPersonInvolvementFactory.build({}, { transient: { savedResponses: [] } }),
    ]

    responses.forEach(response => {
      response.questions.forEach(question => {
        expect(question.savedResponses).toEqual([])
      })
    })
  })
})
