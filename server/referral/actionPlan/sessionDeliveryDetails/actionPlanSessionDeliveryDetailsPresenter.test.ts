import { ActionPlanSessionDeliveryDetailsResponse } from '@community-support-api'
import { Response } from 'express'
import ActionPlanSessionDeliveryDetailsPresenter from './actionPlanSessionDeliveryDetailsPresenter'
import { globalContent } from '../../../../assets/content/GlobalContent'
import { ActionPlanSessionDeliveryDetailsViewModel } from './actionPlanSessionDeliveryDetailsViewModel'

describe('ActionPlanSessionDeliveryDetailsPresenter', () => {
  const sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse = {
    questions: [
      {
        id: 'e8f3b4f9-8d84-4b3a-9f47-5f78f4cb3101',
        displayOrder: 1,
        label: 'How often will sessions take place?',
        key: 'SESSION_FREQUENCY',
        hint: 'For example, every week, every 2 weeks, every month.',
        answerType: 'TEXTAREA',
        maximumNumberOfResponses: 1,
        choices: null,
        savedResponses: [],
      },
      {
        id: 'e8f3b4f9-8d84-4b3a-9f47-5f78f4cb3102',
        displayOrder: 2,
        label: 'How will the sessions take place?',
        key: 'SESSION_DELIVERY_METHOD',
        hint: 'Select one option.',
        answerType: 'RADIO',
        maximumNumberOfResponses: 1,
        choices: [
          {
            value: 'IN_PERSON',
            label: 'In person',
            displayOrder: 1,
            displayAdditionalDetailsOnSelect: false,
            additionalDetailsLabel: null,
            additionalDetailsHint: null,
          },
          {
            value: 'VIDEO_CALL',
            label: 'Video call',
            displayOrder: 2,
            displayAdditionalDetailsOnSelect: true,
            additionalDetailsLabel: 'Why are the sessions not in person?',
            additionalDetailsHint: null,
          },
          {
            value: 'PHONE_CALL',
            label: 'Phone call',
            displayOrder: 3,
            displayAdditionalDetailsOnSelect: true,
            additionalDetailsLabel: 'Why are the sessions not in person?',
            additionalDetailsHint: null,
          },
        ],
        savedResponses: [],
      },
      {
        id: 'e8f3b4f9-8d84-4b3a-9f47-5f78f4cb3103',
        displayOrder: 3,
        label: 'What format will you use for the sessions?',
        key: 'SESSION_FORMAT',
        hint: 'Select all that apply.',
        answerType: 'CHECKBOX',
        maximumNumberOfResponses: 2,
        choices: [
          {
            value: 'ONE_TO_ONE_SESSION',
            label: 'One-to-one session',
            displayOrder: 1,
            displayAdditionalDetailsOnSelect: false,
            additionalDetailsLabel: null,
            additionalDetailsHint: null,
          },
          {
            value: 'GROUP_SESSION',
            label: 'Group session',
            displayOrder: 2,
            displayAdditionalDetailsOnSelect: false,
            additionalDetailsLabel: null,
            additionalDetailsHint: null,
          },
        ],
        savedResponses: [{ value: 'GROUP_SESSION', additionalDetails: null }],
      },
    ],
  }

  const buildResponse = (): Response =>
    ({
      locals: {
        content: globalContent['/referral/:id/action-plan/session-delivery-details'],
      },
      render: jest.fn(),
    }) as unknown as Response

  const renderAndGetContent = (
    caseReference: string,
    details: ActionPlanSessionDeliveryDetailsResponse,
    validationErrors?: ConstructorParameters<typeof ActionPlanSessionDeliveryDetailsPresenter>[2],
    userInputData?: ConstructorParameters<typeof ActionPlanSessionDeliveryDetailsPresenter>[3],
  ): ActionPlanSessionDeliveryDetailsViewModel => {
    const res = buildResponse()
    new ActionPlanSessionDeliveryDetailsPresenter(caseReference, details, validationErrors, userInputData).renderPage(
      res,
    )
    return (res.render as jest.Mock).mock.calls[0][1].content
  }

  it('builds the page header, back link and submit button', () => {
    const content = renderAndGetContent('AB1234CD', sessionDeliveryDetails)

    expect(content.pageHeader).toBe('Session details')
    expect(content.backLink).toEqual({ href: '/referral/AB1234CD/action-plan/add-activities' })
    expect(content.submitButton).toEqual({ text: 'Continue' })
    expect(content.submitHref).toBe('/referral/AB1234CD/action-plan/session-delivery-details')
  })

  it('builds the frequency textarea from the TEXTAREA question', () => {
    const content = renderAndGetContent('AB1234CD', sessionDeliveryDetails)

    expect(content.frequencyTextBoxArgs).toMatchObject({
      id: 'SESSION_FREQUENCY',
      name: 'SESSION_FREQUENCY',
      label: { text: 'How often will sessions take place?' },
      hint: { text: 'For example, every week, every 2 weeks, every month.' },
      value: '',
    })
  })

  it('prefills the frequency textarea value from userInputData', () => {
    const content = renderAndGetContent('AB1234CD', sessionDeliveryDetails, undefined, {
      SESSION_FREQUENCY: 'Every week',
    })

    expect(content.frequencyTextBoxArgs.value).toBe('Every week')
  })

  it('prefills the frequency textarea value from savedResponses when there is no userInputData', () => {
    const detailsWithSavedFrequency: ActionPlanSessionDeliveryDetailsResponse = {
      questions: [
        {
          ...sessionDeliveryDetails.questions[0],
          savedResponses: [{ value: 'Every 2 weeks', additionalDetails: null }],
        },
        sessionDeliveryDetails.questions[1],
        sessionDeliveryDetails.questions[2],
      ],
    }

    const content = renderAndGetContent('AB1234CD', detailsWithSavedFrequency)

    expect(content.frequencyTextBoxArgs.value).toBe('Every 2 weeks')
  })

  it('builds the how radios with conditional html slotted in by choice value', () => {
    const content = renderAndGetContent('AB1234CD', sessionDeliveryDetails)

    const radios = content.howRadioArgs('<div>video reason</div>', '<div>phone reason</div>')

    expect(radios.idPrefix).toBe('SESSION_DELIVERY_METHOD')
    expect(radios.name).toBe('SESSION_DELIVERY_METHOD')
    expect(radios.fieldset?.legend?.text).toBe('How will the sessions take place?')
    expect(radios.items).toHaveLength(3)

    const inPerson = radios.items.find(item => item.value === 'IN_PERSON')
    const videoCall = radios.items.find(item => item.value === 'VIDEO_CALL')
    const phoneCall = radios.items.find(item => item.value === 'PHONE_CALL')

    expect(inPerson?.conditional).toBeUndefined()
    expect(videoCall?.conditional).toEqual({ html: '<div>video reason</div>' })
    expect(phoneCall?.conditional).toEqual({ html: '<div>phone reason</div>' })
  })

  it('marks the radio item as checked based on userInputData', () => {
    const content = renderAndGetContent('AB1234CD', sessionDeliveryDetails, undefined, {
      SESSION_DELIVERY_METHOD: 'VIDEO_CALL',
    })

    const radios = content.howRadioArgs('', '')

    expect(radios.items.find(item => item.value === 'VIDEO_CALL')?.checked).toBe(true)
    expect(radios.items.find(item => item.value === 'IN_PERSON')?.checked).toBe(false)
  })

  it('marks the radio item as checked from savedResponses when there is no userInputData', () => {
    const detailsWithSavedDeliveryMethod: ActionPlanSessionDeliveryDetailsResponse = {
      questions: [
        sessionDeliveryDetails.questions[0],
        {
          ...sessionDeliveryDetails.questions[1],
          savedResponses: [{ value: 'PHONE_CALL', additionalDetails: null }],
        },
        sessionDeliveryDetails.questions[2],
      ],
    }

    const content = renderAndGetContent('AB1234CD', detailsWithSavedDeliveryMethod)

    const radios = content.howRadioArgs('', '')

    expect(radios.items.find(item => item.value === 'PHONE_CALL')?.checked).toBe(true)
    expect(radios.items.find(item => item.value === 'IN_PERSON')?.checked).toBe(false)
  })

  it('builds the video call and phone call reason textareas from the choice additional details label', () => {
    const content = renderAndGetContent('AB1234CD', sessionDeliveryDetails)

    expect(content.videoCallReasonTextBoxArgs).toMatchObject({
      id: 'VIDEO_CALL',
      name: 'VIDEO_CALL',
      label: { text: 'Why are the sessions not in person?' },
      value: '',
    })
    expect(content.phoneCallReasonTextBoxArgs).toMatchObject({
      id: 'PHONE_CALL',
      name: 'PHONE_CALL',
      label: { text: 'Why are the sessions not in person?' },
      value: '',
    })
  })

  it('prefills the video call and phone call reason textareas from userInputData', () => {
    const content = renderAndGetContent('AB1234CD', sessionDeliveryDetails, undefined, {
      VIDEO_CALL: 'Travel restrictions',
      PHONE_CALL: 'No transport available',
    })

    expect(content.videoCallReasonTextBoxArgs.value).toBe('Travel restrictions')
    expect(content.phoneCallReasonTextBoxArgs.value).toBe('No transport available')
  })

  it('prefills the video call reason textarea from savedResponses when there is no userInputData', () => {
    const detailsWithSavedReason: ActionPlanSessionDeliveryDetailsResponse = {
      questions: [
        sessionDeliveryDetails.questions[0],
        {
          ...sessionDeliveryDetails.questions[1],
          savedResponses: [{ value: 'VIDEO_CALL', additionalDetails: 'Travel restrictions' }],
        },
        sessionDeliveryDetails.questions[2],
      ],
    }

    const content = renderAndGetContent('AB1234CD', detailsWithSavedReason)

    expect(content.videoCallReasonTextBoxArgs.value).toBe('Travel restrictions')
    expect(content.phoneCallReasonTextBoxArgs.value).toBe('')
  })

  it('builds the format checkboxes with saved responses checked', () => {
    const content = renderAndGetContent('AB1234CD', sessionDeliveryDetails)

    expect(content.formatCheckboxArgs.idPrefix).toBe('SESSION_FORMAT')
    expect(content.formatCheckboxArgs.name).toBe('SESSION_FORMAT')
    expect(content.formatCheckboxArgs.fieldset?.legend?.text).toBe('What format will you use for the sessions?')
    expect(content.formatCheckboxArgs.items).toEqual([
      expect.objectContaining({ text: 'One-to-one session', value: 'ONE_TO_ONE_SESSION', checked: false }),
      expect.objectContaining({ text: 'Group session', value: 'GROUP_SESSION', checked: true }),
    ])
  })

  it('marks checkboxes as checked from userInputData array values, ignoring saved responses', () => {
    const content = renderAndGetContent('AB1234CD', sessionDeliveryDetails, undefined, {
      SESSION_FORMAT: ['ONE_TO_ONE_SESSION'],
    })

    expect(content.formatCheckboxArgs.items).toEqual([
      expect.objectContaining({ value: 'ONE_TO_ONE_SESSION', checked: true }),
      expect.objectContaining({ value: 'GROUP_SESSION', checked: false }),
    ])
  })

  it('marks a single checked checkbox from a plain string value without matching by substring', () => {
    const content = renderAndGetContent('AB1234CD', sessionDeliveryDetails, undefined, {
      SESSION_FORMAT: 'ONE_TO_ONE_SESSION',
    })

    expect(content.formatCheckboxArgs.items).toEqual([
      expect.objectContaining({ value: 'ONE_TO_ONE_SESSION', checked: true }),
      expect.objectContaining({ value: 'GROUP_SESSION', checked: false }),
    ])
  })

  it('does not falsely match a choice whose value is a substring of the submitted value', () => {
    const detailsWithOverlappingValues: ActionPlanSessionDeliveryDetailsResponse = {
      questions: [
        sessionDeliveryDetails.questions[0],
        sessionDeliveryDetails.questions[1],
        {
          ...sessionDeliveryDetails.questions[2],
          choices: [
            { ...sessionDeliveryDetails.questions[2].choices[0], value: 'ONE' },
            { ...sessionDeliveryDetails.questions[2].choices[1], value: 'ONE_TO_ONE_SESSION' },
          ],
        },
      ],
    }

    const content = renderAndGetContent('AB1234CD', detailsWithOverlappingValues, undefined, {
      SESSION_FORMAT: 'ONE_TO_ONE_SESSION',
    })

    expect(content.formatCheckboxArgs.items).toEqual([
      expect.objectContaining({ value: 'ONE', checked: false }),
      expect.objectContaining({ value: 'ONE_TO_ONE_SESSION', checked: true }),
    ])
  })

  it('sets validation error messages against the relevant fields', () => {
    const content = renderAndGetContent('AB1234CD', sessionDeliveryDetails, {
      list: [],
      messages: {
        SESSION_FREQUENCY: { text: 'Enter how often the sessions will take place' },
        SESSION_DELIVERY_METHOD: { text: 'Select how the sessions will take place' },
        SESSION_FORMAT: { text: 'Select which format you will use for the sessions' },
        VIDEO_CALL: { text: 'Enter why the sessions are not in person' },
        PHONE_CALL: { text: 'Enter why the sessions are not in person' },
      },
    })

    expect(content.frequencyTextBoxArgs.errorMessage).toEqual({ text: 'Enter how often the sessions will take place' })
    expect(content.howRadioArgs('', '').errorMessage).toEqual({ text: 'Select how the sessions will take place' })
    expect(content.formatCheckboxArgs.errorMessage).toEqual({
      text: 'Select which format you will use for the sessions',
    })
    expect(content.videoCallReasonTextBoxArgs.errorMessage).toEqual({
      text: 'Enter why the sessions are not in person',
    })
    expect(content.phoneCallReasonTextBoxArgs.errorMessage).toEqual({
      text: 'Enter why the sessions are not in person',
    })
  })
})
