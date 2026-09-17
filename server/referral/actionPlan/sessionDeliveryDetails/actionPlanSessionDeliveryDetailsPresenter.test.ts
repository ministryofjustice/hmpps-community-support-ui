import { ActionPlanSessionDeliveryDetailsResponse } from '@community-support-api'
import { Response } from 'express'
import ActionPlanSessionDeliveryDetailsPresenter from './actionPlanSessionDeliveryDetailsPresenter'
import { globalContent } from '../../../../assets/content/GlobalContent'

describe('ActionPlanSessionDeliveryDetailsPresenter', () => {
  it('builds textarea, radio and checkbox questions with hints and saved responses', () => {
    const sessionDeliveryDetails: ActionPlanSessionDeliveryDetailsResponse = {
      questions: [
        {
          id: 'question-1',
          displayOrder: 1,
          label: 'How often will sessions take place?',
          hint: 'For example, every week, every 2 weeks, every month.',
          answerType: 'TEXTAREA',
          maximumNumberOfResponses: 1,
          choices: null,
          savedResponses: [{ value: 'Every week', additionalDetails: null }],
        },
        {
          id: 'question-2',
          displayOrder: 2,
          label: 'How will the sessions take place?',
          hint: 'Select one option.',
          answerType: 'RADIO',
          maximumNumberOfResponses: 1,
          choices: [
            {
              value: 'IN_PERSON',
              label: 'In person',
              displayOrder: 1,
              displayAdditionalDetailsOnSelect: true,
              additionalDetailsLabel: 'Reason for not being in person',
              additionalDetailsHint: 'Why are the sessions not in person?',
            },
            {
              value: 'VIDEO_CALL',
              label: 'Video call',
              displayOrder: 2,
              displayAdditionalDetailsOnSelect: true,
              additionalDetailsLabel: 'Reason for not being in person',
              additionalDetailsHint: 'Why are the sessions not in person?',
            },
          ],
          savedResponses: [{ value: 'VIDEO_CALL', additionalDetails: 'Travel restrictions' }],
        },
        {
          id: 'question-3',
          displayOrder: 3,
          label: 'What format will you use for the sessions?',
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

    const res = {
      locals: {
        content: globalContent['/referral/:id/action-plan/session-delivery-details'],
      },
      render: jest.fn(),
    } as unknown as Response

    new ActionPlanSessionDeliveryDetailsPresenter('AB1234CD', sessionDeliveryDetails).renderPage(res)

    const renderData = (res.render as jest.Mock).mock.calls[0][1] as {
      content: ReturnType<ActionPlanSessionDeliveryDetailsPresenter['buildViewModel']>
    }

    expect(renderData.content.pageHeader).toBe('Session delivery details')
    expect(renderData.content.backLink).toEqual({ href: '/referral/AB1234CD/action-plan/add-activities' })
    expect(renderData.content.questions[0].textarea).toMatchObject({
      name: 'question-question-1',
      hint: { text: 'For example, every week, every 2 weeks, every month.' },
      value: 'Every week',
    })
    expect(renderData.content.questions[1].radios?.items[1]).toMatchObject({
      text: 'Video call',
      value: 'VIDEO_CALL',
      checked: true,
    })
    expect(renderData.content.questions[1].radios?.items[1].conditional?.html).toContain(
      'Why are the sessions not in person?',
    )
    expect(renderData.content.questions[1].radios?.items[1].conditional?.html).toContain('Travel restrictions')
    expect(renderData.content.questions[2].checkboxes?.items[1]).toMatchObject({
      text: 'Group session',
      value: 'GROUP_SESSION',
      checked: true,
    })
  })
})
