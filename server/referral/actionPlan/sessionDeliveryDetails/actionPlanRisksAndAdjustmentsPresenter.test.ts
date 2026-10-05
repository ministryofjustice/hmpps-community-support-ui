import { ActionPlanSessionDeliveryDetailsResponse } from '@community-support-api'
import { Response } from 'express'
import ActionPlanRisksAndAdjustmentsPresenter from './actionPlanRisksAndAdjustmentsPresenter'
import { globalContent } from '../../../../assets/content/GlobalContent'
import { ActionPlanRisksAndAdjustmentsViewModel } from './actionPlanRisksAndAdjustmentsViewModel'

describe('ActionPlanRisksAndAdjustmentsPresenter', () => {
  const sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse = {
    questions: [
      {
        id: 'e8f3b4f9-8d84-4b3a-9f47-5f78f4cb3201',
        displayOrder: 1,
        label: 'Is there a risk associated with the planned activities?',
        key: 'RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES',
        hint: 'Select one option.',
        answerType: 'RADIO',
        maximumNumberOfResponses: 1,
        choices: [
          {
            value: 'YES',
            label: 'Yes',
            displayOrder: 1,
            displayAdditionalDetailsOnSelect: true,
            additionalDetailsLabel: 'Give details of the risk',
            additionalDetailsHint: null,
          },
          {
            value: 'NO',
            label: 'No',
            displayOrder: 2,
            displayAdditionalDetailsOnSelect: false,
            additionalDetailsLabel: null,
            additionalDetailsHint: null,
          },
        ],
        savedResponses: [],
      },
      {
        id: 'e8f3b4f9-8d84-4b3a-9f47-5f78f4cb3202',
        displayOrder: 2,
        label: 'Will you put reasonable adjustments in place?',
        key: 'REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES',
        hint: 'Select one option.',
        answerType: 'RADIO',
        maximumNumberOfResponses: 1,
        choices: [
          {
            value: 'YES',
            label: 'Yes',
            displayOrder: 1,
            displayAdditionalDetailsOnSelect: true,
            additionalDetailsLabel: 'Give details of the adjustments',
            additionalDetailsHint: null,
          },
          {
            value: 'NO',
            label: 'No',
            displayOrder: 2,
            displayAdditionalDetailsOnSelect: false,
            additionalDetailsLabel: null,
            additionalDetailsHint: null,
          },
        ],
        savedResponses: [],
      },
    ],
  }

  const buildResponse = (): Response =>
    ({
      locals: {
        content: globalContent['/referral/:id/action-plan/risks-and-adjustments'],
      },
      render: jest.fn(),
    }) as unknown as Response

  const renderAndGetContent = (
    caseReference: string,
    details: ActionPlanSessionDeliveryDetailsResponse,
    validationErrors?: ConstructorParameters<typeof ActionPlanRisksAndAdjustmentsPresenter>[2],
    userInputData?: ConstructorParameters<typeof ActionPlanRisksAndAdjustmentsPresenter>[3],
  ): ActionPlanRisksAndAdjustmentsViewModel => {
    const res = buildResponse()
    new ActionPlanRisksAndAdjustmentsPresenter(caseReference, details, validationErrors, userInputData).renderPage(res)
    return (res.render as jest.Mock).mock.calls[0][1].content
  }

  it('builds the page header, back link and submit button', () => {
    const content = renderAndGetContent('AB1234CD', sessionDeliveryDetails)

    expect(content.pageHeader).toBe('Risks and adjustments')
    expect(content.backLink).toEqual({ href: '/referral/AB1234CD/action-plan/session-delivery-details' })
    expect(content.submitButton).toEqual({ text: 'Continue' })
  })

  it('builds the risk radios with conditional html slotted in for the YES choice', () => {
    const content = renderAndGetContent('AB1234CD', sessionDeliveryDetails)

    const radios = content.plannedActivitiesRiskRadioArgs('<div>risk info</div>')

    expect(radios.idPrefix).toBe('RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES')
    expect(radios.name).toBe('RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES')
    expect(radios.fieldset?.legend?.text).toBe('Is there a risk associated with the planned activities?')
    expect(radios.items).toHaveLength(2)

    const yes = radios.items.find(item => item.value === 'YES')
    const no = radios.items.find(item => item.value === 'NO')

    expect(yes?.conditional).toEqual({ html: '<div>risk info</div>' })
    expect(no?.conditional).toBeUndefined()
  })

  it('builds the adjustments radios with conditional html slotted in for the YES choice', () => {
    const content = renderAndGetContent('AB1234CD', sessionDeliveryDetails)

    const radios = content.plannedActivitiesAdjustmentsRadioArgs('<div>adjustment info</div>')

    expect(radios.idPrefix).toBe('REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES')
    expect(radios.name).toBe('REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES')
    expect(radios.fieldset?.legend?.text).toBe('Will you put reasonable adjustments in place?')

    const yes = radios.items.find(item => item.value === 'YES')
    expect(yes?.conditional).toEqual({ html: '<div>adjustment info</div>' })
  })

  it('marks the risk radio item as checked based on userInputData', () => {
    const content = renderAndGetContent('AB1234CD', sessionDeliveryDetails, undefined, {
      RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES: 'YES',
    })

    const radios = content.plannedActivitiesRiskRadioArgs('')

    expect(radios.items.find(item => item.value === 'YES')?.checked).toBe(true)
    expect(radios.items.find(item => item.value === 'NO')?.checked).toBe(false)
  })

  it('marks the risk radio item as checked from savedResponses when there is no userInputData', () => {
    const detailsWithSavedRisk: ActionPlanSessionDeliveryDetailsResponse = {
      questions: [
        {
          ...sessionDeliveryDetails.questions[0],
          savedResponses: [{ value: 'NO', additionalDetails: null }],
        },
        sessionDeliveryDetails.questions[1],
      ],
    }

    const content = renderAndGetContent('AB1234CD', detailsWithSavedRisk)

    const radios = content.plannedActivitiesRiskRadioArgs('')

    expect(radios.items.find(item => item.value === 'NO')?.checked).toBe(true)
    expect(radios.items.find(item => item.value === 'YES')?.checked).toBe(false)
  })

  it('marks the adjustments radio item as checked based on userInputData, independently of the risk answer', () => {
    const content = renderAndGetContent('AB1234CD', sessionDeliveryDetails, undefined, {
      RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES: 'NO',
      REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES: 'YES',
    })

    const riskRadios = content.plannedActivitiesRiskRadioArgs('')
    const adjustmentsRadios = content.plannedActivitiesAdjustmentsRadioArgs('')

    expect(riskRadios.items.find(item => item.value === 'YES')?.checked).toBe(false)
    expect(adjustmentsRadios.items.find(item => item.value === 'YES')?.checked).toBe(true)
  })

  it('builds the risk and adjustment reason textareas from the choice additional details label', () => {
    const content = renderAndGetContent('AB1234CD', sessionDeliveryDetails)

    expect(content.riskInfoTextBoxArgs).toMatchObject({
      id: 'RISK_INFO',
      name: 'RISK_INFO',
      label: { text: 'Give details of the risk' },
      value: '',
    })
    expect(content.adjustmentInfoTextBoxArgs).toMatchObject({
      id: 'ADJUSTMENT_INFO',
      name: 'ADJUSTMENT_INFO',
      label: { text: 'Give details of the adjustments' },
      value: '',
    })
  })

  it('prefills the risk and adjustment reason textareas from userInputData', () => {
    const content = renderAndGetContent('AB1234CD', sessionDeliveryDetails, undefined, {
      RISK_INFO: 'Risk of harm to staff',
      ADJUSTMENT_INFO: 'Provide a hearing loop',
    })

    expect(content.riskInfoTextBoxArgs.value).toBe('Risk of harm to staff')
    expect(content.adjustmentInfoTextBoxArgs.value).toBe('Provide a hearing loop')
  })

  it('prefills the risk reason textarea from savedResponses when there is no userInputData', () => {
    const detailsWithSavedReason: ActionPlanSessionDeliveryDetailsResponse = {
      questions: [
        {
          ...sessionDeliveryDetails.questions[0],
          savedResponses: [{ value: 'YES', additionalDetails: 'Risk of harm to staff' }],
        },
        sessionDeliveryDetails.questions[1],
      ],
    }

    const content = renderAndGetContent('AB1234CD', detailsWithSavedReason)

    expect(content.riskInfoTextBoxArgs.value).toBe('Risk of harm to staff')
    expect(content.adjustmentInfoTextBoxArgs.value).toBe('')
  })

  it('sets validation error messages against the relevant fields', () => {
    const content = renderAndGetContent('AB1234CD', sessionDeliveryDetails, {
      list: [],
      messages: {
        RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES: { text: 'Select yes if there are any risks' },
        REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES: { text: 'Select yes if you will make adjustments' },
        RISK_INFO: { text: 'Enter details about the risks' },
        ADJUSTMENT_INFO: { text: 'Enter details about the adjustments' },
      },
    })

    expect(content.plannedActivitiesRiskRadioArgs('').errorMessage).toEqual({
      text: 'Select yes if there are any risks',
    })
    expect(content.plannedActivitiesAdjustmentsRadioArgs('').errorMessage).toEqual({
      text: 'Select yes if you will make adjustments',
    })
    expect(content.riskInfoTextBoxArgs.errorMessage).toEqual({ text: 'Enter details about the risks' })
    expect(content.adjustmentInfoTextBoxArgs.errorMessage).toEqual({ text: 'Enter details about the adjustments' })
  })
})
