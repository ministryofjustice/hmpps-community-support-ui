import { ActionPlanSessionDeliveryDetailsResponse } from '@community-support-api'
import { Response } from 'express'
import ActionPlanServiceEndDateCheckPresenter from './actionPlanServiceEndDateCheckPresenter'
import { globalContent } from '../../../../assets/content/GlobalContent'
import { ServiceEndDateCheckViewModel } from './serviceEndDateCheckViewModel'

describe('ActionPlanServiceEndDateCheckPresenter', () => {
  const sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse = {
    questions: [
      {
        id: 'e8f3b4f9-8d84-4b3a-9f47-5f78f4cb3203',
        displayOrder: 1,
        label: 'Is the service end date still 24 May 2026?',
        key: 'SERVICE_END_DATE_CHECK',
        hint: 'Select one option.',
        answerType: 'RADIO',
        maximumNumberOfResponses: 1,
        choices: [
          {
            value: 'YES',
            label: 'Yes',
            displayOrder: 1,
            displayAdditionalDetailsOnSelect: false,
            additionalDetailsLabel: null,
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
        content: globalContent['/referral/:id/action-plan/service-end-date-check'],
      },
      render: jest.fn(),
    }) as unknown as Response

  const renderAndGetContent = (
    caseReference: string,
    details: ActionPlanSessionDeliveryDetailsResponse,
    validationErrors?: ConstructorParameters<typeof ActionPlanServiceEndDateCheckPresenter>[2],
    userInputData?: ConstructorParameters<typeof ActionPlanServiceEndDateCheckPresenter>[3],
  ): ServiceEndDateCheckViewModel => {
    const res = buildResponse()
    new ActionPlanServiceEndDateCheckPresenter(caseReference, details, validationErrors, userInputData).renderPage(res)
    return (res.render as jest.Mock).mock.calls[0][1].content
  }

  it('renders the expected template with the page header, back link and submit button', () => {
    const res = buildResponse()
    new ActionPlanServiceEndDateCheckPresenter('AB1234CD', sessionDeliveryDetails).renderPage(res)

    expect(res.render).toHaveBeenCalledWith(
      'referral/actionPlanServiceEndDateCheck',
      expect.objectContaining({ content: expect.anything() }),
    )

    const content = renderAndGetContent('AB1234CD', sessionDeliveryDetails)
    expect(content.pageHeader).toBe('Service end date')
    expect(content.backLink).toEqual({ href: '/referral/AB1234CD/action-plan/risks-and-adjustments' })
    expect(content.submitButton).toEqual({ text: 'Continue' })
  })

  it.each([
    { edit: true, saved: 'YES', submitted: undefined, expected: 'Save and continue' },
    { edit: true, saved: 'NO', submitted: undefined, expected: 'Continue' },
    { edit: true, saved: 'YES', submitted: 'NO', expected: 'Continue' },
    { edit: true, saved: 'NO', submitted: 'YES', expected: 'Save and continue' },
    { edit: false, saved: 'YES', submitted: undefined, expected: 'Continue' },
    { edit: false, saved: 'NO', submitted: undefined, expected: 'Continue' },
  ])('uses $expected with edit=$edit, saved=$saved, submitted=$submitted', ({ edit, saved, submitted, expected }) => {
    const res = buildResponse()
    const details: ActionPlanSessionDeliveryDetailsResponse = {
      questions: sessionDeliveryDetails.questions.map(
        (question): ActionPlanSessionDeliveryDetailsResponse['questions'][number] => ({
          ...question,
          savedResponses: [{ value: saved, additionalDetails: null }],
        }),
      ),
    }
    new ActionPlanServiceEndDateCheckPresenter(
      'AB1234CD',
      details,
      undefined,
      submitted ? { SERVICE_END_DATE_CHECK: submitted } : undefined,
      edit,
    ).renderPage(res)

    const { content } = (res.render as jest.Mock).mock.calls[0][1]
    expect(content.submitButton.text).toBe(expected)
    expect(content.submitButton.attributes).toBeUndefined()
  })

  it('builds the service end date check radios', () => {
    const content = renderAndGetContent('AB1234CD', sessionDeliveryDetails)

    const { serviceEndDateCheckRadioArgs: radios } = content

    expect(radios.idPrefix).toBe('SERVICE_END_DATE_CHECK')
    expect(radios.name).toBe('SERVICE_END_DATE_CHECK')
    expect(radios.fieldset?.legend?.text).toBe('Is the service end date still 24 May 2026?')
    expect(radios.hint).toEqual({ text: 'Select one option.' })
    expect(radios.items).toHaveLength(2)
  })

  it('marks the radio item as checked based on userInputData', () => {
    const content = renderAndGetContent('AB1234CD', sessionDeliveryDetails, undefined, {
      SERVICE_END_DATE_CHECK: 'NO',
    })

    const { items } = content.serviceEndDateCheckRadioArgs

    expect(items.find(item => item.value === 'NO')?.checked).toBe(true)
    expect(items.find(item => item.value === 'YES')?.checked).toBe(false)
  })

  it('marks the radio item as checked from savedResponses when there is no userInputData', () => {
    const detailsWithSavedResponse: ActionPlanSessionDeliveryDetailsResponse = {
      questions: [
        {
          ...sessionDeliveryDetails.questions[0],
          savedResponses: [{ value: 'YES', additionalDetails: null }],
        },
      ],
    }

    const content = renderAndGetContent('AB1234CD', detailsWithSavedResponse)

    const { items } = content.serviceEndDateCheckRadioArgs

    expect(items.find(item => item.value === 'YES')?.checked).toBe(true)
    expect(items.find(item => item.value === 'NO')?.checked).toBe(false)
  })

  it('leaves both radio items unchecked when there is neither userInputData nor a saved response', () => {
    const content = renderAndGetContent('AB1234CD', sessionDeliveryDetails)

    const { items } = content.serviceEndDateCheckRadioArgs

    expect(items.find(item => item.value === 'YES')?.checked).toBe(false)
    expect(items.find(item => item.value === 'NO')?.checked).toBe(false)
  })

  it('sets the validation error message against the question field', () => {
    const content = renderAndGetContent('AB1234CD', sessionDeliveryDetails, {
      list: [],
      messages: {
        SERVICE_END_DATE_CHECK: { text: 'Select yes if the service end date is still 24 May 2026' },
      },
    })

    expect(content.serviceEndDateCheckRadioArgs.errorMessage).toEqual({
      text: 'Select yes if the service end date is still 24 May 2026',
    })
  })

  it('builds the inset text with the service end date message', () => {
    const content = renderAndGetContent('AB1234CD', sessionDeliveryDetails)

    expect(content.insetTextArgs).toEqual({
      text: 'This referral states the service should be completed by 24 May 2026',
    })
  })
})
