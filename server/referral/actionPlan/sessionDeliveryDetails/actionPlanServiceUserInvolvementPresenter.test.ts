import { ActionPlanSessionDeliveryDetailsResponse } from '@community-support-api'
import { Response } from 'express'
import ActionPlanServiceUserInvolvementPresenter from './actionPlanServiceUserInvolvementPresenter'
import { globalContent } from '../../../../assets/content/GlobalContent'
import { ActionPlanServiceUserInvolvementViewModel } from './actionPlanServiceUserInvolvementViewModel'

describe('ActionPlanServiceUserInvolvementPresenter', () => {
  const sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse = {
    questions: [
      {
        id: 'e8f3b4f9-8d84-4b3a-9f47-5f78f4cb3201',
        displayOrder: 1,
        label: 'Was the person involved in creating the action plan?',
        key: 'USER_INVOLVEMENT_IN_ACTION_PLAN',
        hint: 'Select one option.',
        answerType: 'RADIO',
        maximumNumberOfResponses: 1,
        choices: [
          {
            value: 'NO',
            label: 'No',
            displayOrder: 2,
            displayAdditionalDetailsOnSelect: true,
            additionalDetailsLabel: 'Why were they not involved?',
            additionalDetailsHint: null,
          },
          {
            value: 'YES',
            label: 'Yes',
            displayOrder: 1,
            displayAdditionalDetailsOnSelect: false,
            additionalDetailsLabel: null,
            additionalDetailsHint: null,
          },
        ],
        savedResponses: [],
      },
    ],
  }

  const withSavedResponses = (
    savedResponses: ActionPlanSessionDeliveryDetailsResponse['questions'][number]['savedResponses'],
  ): ActionPlanSessionDeliveryDetailsResponse => ({
    questions: [{ ...sessionDeliveryDetails.questions[0], savedResponses }],
  })

  const buildResponse = (): Response =>
    ({
      locals: {
        content: globalContent['/referral/:id/action-plan/person-involvement'],
      },
      render: jest.fn(),
    }) as unknown as Response

  const renderAndGetContent = (
    details: ActionPlanSessionDeliveryDetailsResponse,
    validationErrors?: ConstructorParameters<typeof ActionPlanServiceUserInvolvementPresenter>[2],
    userInputData?: ConstructorParameters<typeof ActionPlanServiceUserInvolvementPresenter>[3],
  ): { viewModel: ActionPlanServiceUserInvolvementViewModel; res: Response } => {
    const res = buildResponse()
    new ActionPlanServiceUserInvolvementPresenter('AB1234CD', details, validationErrors, userInputData).renderPage(res)
    return { viewModel: (res.render as jest.Mock).mock.calls[0][1].content, res }
  }

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders the person involvement template', () => {
    const { res } = renderAndGetContent(sessionDeliveryDetails)

    expect((res.render as jest.Mock).mock.calls[0][0]).toBe('referral/actionPlanServiceUserInvolvement')
  })

  it('builds the page title, back link and submit button', () => {
    const { viewModel } = renderAndGetContent(sessionDeliveryDetails)

    expect(viewModel.pageTitle).toBe('Session details – Person involvement')
    expect(viewModel.backLink).toEqual({ href: '/referral/AB1234CD/action-plan/service-end-date-check' })
    expect(viewModel.submitButton).toEqual({ text: 'Continue' })
  })

  it('builds the radios sorted by display order with the conditional html on the NO choice only', () => {
    const { viewModel } = renderAndGetContent(sessionDeliveryDetails)

    const radios = viewModel.userInvolvementInActionPlanRadioArgs('<div>why not</div>')

    expect(radios.idPrefix).toBe('USER_INVOLVEMENT_IN_ACTION_PLAN')
    expect(radios.name).toBe('USER_INVOLVEMENT_IN_ACTION_PLAN')
    expect(radios.fieldset?.legend?.text).toBe('Was the person involved in creating the action plan?')
    expect(radios.hint).toEqual({ text: 'Select one option.' })
    expect(radios.items.map(item => item.value)).toEqual(['YES', 'NO'])
    expect(radios.items[0].conditional).toBeUndefined()
    expect(radios.items[1].conditional).toEqual({ html: '<div>why not</div>' })
  })

  it('checks the radio from userInputData', () => {
    const { viewModel } = renderAndGetContent(sessionDeliveryDetails, undefined, {
      USER_INVOLVEMENT_IN_ACTION_PLAN: 'NO',
    })

    const radios = viewModel.userInvolvementInActionPlanRadioArgs('')

    expect(radios.items.find(item => item.value === 'NO')?.checked).toBe(true)
    expect(radios.items.find(item => item.value === 'YES')?.checked).toBe(false)
  })

  it('checks the radio from savedResponses when there is no userInputData', () => {
    const { viewModel } = renderAndGetContent(withSavedResponses([{ value: 'YES', additionalDetails: null }]))

    const radios = viewModel.userInvolvementInActionPlanRadioArgs('')

    expect(radios.items.find(item => item.value === 'YES')?.checked).toBe(true)
    expect(radios.items.find(item => item.value === 'NO')?.checked).toBe(false)
  })

  it('prefers userInputData over savedResponses for the checked radio', () => {
    const { viewModel } = renderAndGetContent(
      withSavedResponses([{ value: 'YES', additionalDetails: null }]),
      undefined,
      { USER_INVOLVEMENT_IN_ACTION_PLAN: 'NO' },
    )

    const radios = viewModel.userInvolvementInActionPlanRadioArgs('')

    expect(radios.items.find(item => item.value === 'NO')?.checked).toBe(true)
    expect(radios.items.find(item => item.value === 'YES')?.checked).toBe(false)
  })

  it('builds the why not involved textarea from the NO choice', () => {
    const { viewModel } = renderAndGetContent(sessionDeliveryDetails)

    expect(viewModel.whyNotInvolvedTextBoxArgs).toMatchObject({
      id: 'WHY_NOT_INVOLVED',
      name: 'WHY_NOT_INVOLVED',
      label: { text: 'Why were they not involved?' },
      rows: '5',
      value: '',
    })
  })

  it('prefills the textarea from userInputData', () => {
    const { viewModel } = renderAndGetContent(sessionDeliveryDetails, undefined, {
      WHY_NOT_INVOLVED: 'They were unavailable',
    })

    expect(viewModel.whyNotInvolvedTextBoxArgs.value).toBe('They were unavailable')
  })

  it('uses the first value when userInputData for the textarea is an array', () => {
    const { viewModel } = renderAndGetContent(sessionDeliveryDetails, undefined, {
      WHY_NOT_INVOLVED: ['First', 'Second'],
    })

    expect(viewModel.whyNotInvolvedTextBoxArgs.value).toBe('First')
  })

  it('prefills the textarea from the saved NO response when there is no userInputData', () => {
    const { viewModel } = renderAndGetContent(withSavedResponses([{ value: 'NO', additionalDetails: 'Saved reason' }]))

    expect(viewModel.whyNotInvolvedTextBoxArgs.value).toBe('Saved reason')
  })

  it('sets validation error messages against the relevant fields', () => {
    const { viewModel } = renderAndGetContent(sessionDeliveryDetails, {
      list: [],
      messages: {
        USER_INVOLVEMENT_IN_ACTION_PLAN: { text: 'Select an option' },
        WHY_NOT_INVOLVED: { text: 'Enter why they were not involved' },
      },
    })

    expect(viewModel.userInvolvementInActionPlanRadioArgs('').errorMessage).toEqual({ text: 'Select an option' })
    expect(viewModel.whyNotInvolvedTextBoxArgs.errorMessage).toEqual({ text: 'Enter why they were not involved' })
  })

  it('has no error messages when there are no validation errors', () => {
    const { viewModel } = renderAndGetContent(sessionDeliveryDetails)

    expect(viewModel.userInvolvementInActionPlanRadioArgs('').errorMessage).toBeNull()
    expect(viewModel.whyNotInvolvedTextBoxArgs.errorMessage).toBeNull()
  })
})
