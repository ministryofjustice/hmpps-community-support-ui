import { ActionPlanSessionDeliveryDetailsResponse } from '@community-support-api'
import { Response } from 'express'
import { globalContent } from '../../../../assets/content/GlobalContent'
import ServiceDeliveryCheckYourAnswersPresenter from './serviceDeliveryCheckYourAnswersPresenter'
import { ServiceDeliveryCheckYourAnswersViewModel } from './serviceDeliveryCheckYourAnswersViewModel'

describe('ServiceDeliveryCheckYourAnswersPresenter', () => {
  type Question = ActionPlanSessionDeliveryDetailsResponse['questions'][number]

  const buildQuestion = (
    overrides: Partial<Question> & Pick<Question, 'id' | 'displayOrder' | 'label' | 'key' | 'savedResponses'>,
  ): Question => ({
    answerType: 'TEXTAREA',
    maximumNumberOfResponses: 1,
    choices: null,
    ...overrides,
  })

  const sessionDetails = [
    buildQuestion({
      id: 'question-1',
      displayOrder: 1,
      label: 'How often will sessions take place?',
      key: 'SESSION_FREQUENCY',
      savedResponses: [{ value: 'Every two weeks', additionalDetails: null }],
    }),
    buildQuestion({
      id: 'question-2',
      displayOrder: 2,
      label: 'How will the sessions take place?',
      key: 'SESSION_DELIVERY_METHOD',
      answerType: 'RADIO',
      choices: [
        {
          value: 'IN_PERSON',
          label: 'In person',
          displayOrder: 1,
          displayAdditionalDetailsOnSelect: false,
        },
        {
          value: 'VIDEO_CALL',
          label: 'Video call',
          displayOrder: 2,
          displayAdditionalDetailsOnSelect: true,
          additionalDetailsLabel: 'Why are the sessions not in person?',
        },
      ],
      savedResponses: [{ value: 'VIDEO_CALL', additionalDetails: 'Travel restrictions' }],
    }),
    buildQuestion({
      id: 'question-3',
      displayOrder: 3,
      label: 'What format will you use for the sessions?',
      key: 'SESSION_FORMAT',
      answerType: 'CHECKBOX',
      maximumNumberOfResponses: 2,
      choices: [
        {
          value: 'ONE_TO_ONE_SESSION',
          label: 'One-to-one session',
          displayOrder: 1,
          displayAdditionalDetailsOnSelect: false,
        },
        {
          value: 'GROUP_SESSION',
          label: 'Group session',
          displayOrder: 2,
          displayAdditionalDetailsOnSelect: false,
        },
      ],
      savedResponses: [
        { value: 'ONE_TO_ONE_SESSION', additionalDetails: null },
        { value: 'GROUP_SESSION', additionalDetails: null },
      ],
    }),
  ]

  const risksAndAdjustments = [
    buildQuestion({
      id: 'question-4',
      displayOrder: 1,
      label: 'Are there any risks associated with the planned activities?',
      key: 'RISK_ASSOCIATED_WITH_PLANNED_ACTIVITIES',
      answerType: 'RADIO',
      choices: [
        {
          value: 'YES',
          label: 'Yes',
          displayOrder: 1,
          displayAdditionalDetailsOnSelect: true,
          additionalDetailsLabel: 'Give details about the risks and what you will put in place to reduce them',
          additionalDetailsHint: 'Details about the risks and what you will put in place to reduce them',
        },
        {
          value: 'NO',
          label: 'No',
          displayOrder: 2,
          displayAdditionalDetailsOnSelect: false,
        },
      ],
      savedResponses: [{ value: 'YES', additionalDetails: 'Risk of harm to staff' }],
    }),
    buildQuestion({
      id: 'question-5',
      displayOrder: 2,
      label: 'Will you put any reasonable adjustments in place to help Alex take part in the planned activities?',
      key: 'REASONABLE_ADJUSTMENTS_FOR_PLANNED_ACTIVITIES',
      answerType: 'RADIO',
      choices: [
        {
          value: 'YES',
          label: 'Yes',
          displayOrder: 1,
          displayAdditionalDetailsOnSelect: true,
          additionalDetailsLabel:
            'Give details about what reasonable adjustments you will make and how this will support Alex',
          additionalDetailsHint: 'Reasonable adjustments you will make and how this will support Alex',
        },
        {
          value: 'NO',
          label: 'No',
          displayOrder: 2,
          displayAdditionalDetailsOnSelect: false,
        },
      ],
      savedResponses: [{ value: 'YES', additionalDetails: 'Provide a hearing loop' }],
    }),
  ]

  const serviceEndDate = [
    buildQuestion({
      id: 'question-6',
      displayOrder: 1,
      label: 'Is the service end date still 24 May 2026?',
      key: 'SERVICE_END_DATE_CHECK',
      answerType: 'RADIO',
      choices: [
        { value: 'YES', label: 'Yes', displayOrder: 1, displayAdditionalDetailsOnSelect: false },
        {
          value: 'NO',
          label: 'No',
          displayOrder: 2,
          displayAdditionalDetailsOnSelect: false,
        },
      ],
      savedResponses: [{ value: 'NO', additionalDetails: null }],
    }),
    buildQuestion({
      id: 'question-7',
      displayOrder: 2,
      label: 'What is the new service end date?',
      key: 'NEW_SERVICE_END_DATE',
      answerType: 'DATE',
      savedResponses: [{ value: '2026-06-24', additionalDetails: null }],
    }),
    buildQuestion({
      id: 'question-8',
      displayOrder: 3,
      label: 'Why are you changing the service end date?',
      key: 'SERVICE_END_DATE_CHANGE_REASON',
      savedResponses: [{ value: 'The service requires more time', additionalDetails: null }],
    }),
  ]

  const personInvolvement = [
    buildQuestion({
      id: 'question-9',
      displayOrder: 1,
      label: 'Was the person involved in creating the action plan?',
      key: 'PERSON_INVOLVEMENT',
      answerType: 'RADIO',
      choices: [
        { value: 'YES', label: 'Yes', displayOrder: 1, displayAdditionalDetailsOnSelect: false },
        { value: 'NO', label: 'No', displayOrder: 2, displayAdditionalDetailsOnSelect: false },
      ],
      savedResponses: [{ value: 'YES', additionalDetails: null }],
    }),
    buildQuestion({
      id: 'question-10',
      displayOrder: 2,
      label: 'What was discussed with the person?',
      key: 'PERSON_INVOLVEMENT_DETAILS',
      savedResponses: [{ value: 'Their preferred session times', additionalDetails: null }],
    }),
  ]

  const buildResponse = (): Response =>
    ({
      locals: {
        content: globalContent['/referral/:id/action-plan/service-delivery-check-your-answers'],
      },
      render: jest.fn(),
    }) as unknown as Response

  const renderAndGetContent = (
    sections: [Question[], Question[], Question[], Question[]],
  ): ServiceDeliveryCheckYourAnswersViewModel => {
    const res = buildResponse()
    new ServiceDeliveryCheckYourAnswersPresenter(sections, 'AB1234CD').renderPage(res)
    return (res.render as jest.Mock).mock.calls[0][1].content
  }

  it('builds a summary card for each section with a section-level change link', () => {
    const content = renderAndGetContent([sessionDetails, risksAndAdjustments, serviceEndDate, personInvolvement])

    expect(content.pageTitle).toBe('Session details – Check your answers')
    expect(content.pageHeader).toBe('Check service delivery details')
    expect(content.backLink.href).toBe('/referral/AB1234CD/action-plan/person-involvement')
    expect(content.submitHref).toBe('/referral/AB1234CD/action-plan/service-delivery-check-your-answers')
    expect(content.summaryLists.map(summary => summary.summaryList.card)).toEqual([
      {
        title: { text: 'Session details' },
        actions: {
          items: [{ href: '/referral/AB1234CD/action-plan/change-session-delivery-details', text: 'Change' }],
        },
      },
      {
        title: { text: 'Risks and adjustments' },
        actions: {
          items: [{ href: '/referral/AB1234CD/action-plan/change-risks-and-adjustments', text: 'Change' }],
        },
      },
      {
        title: { text: 'Service end date' },
        actions: {
          items: [{ href: '/referral/AB1234CD/action-plan/change-service-end-date-check', text: 'Change' }],
        },
      },
      {
        title: { text: 'Involvement in creating action plan' },
        actions: {
          items: [{ href: '/referral/AB1234CD/action-plan/change-person-involvement', text: 'Change' }],
        },
      },
    ])
    expect(content.summaryLists.map(summary => summary.summaryList.rows)).toEqual([
      [
        { key: { text: 'How often will sessions take place?' }, value: { text: 'Every two weeks' } },
        { key: { text: 'How will the sessions take place?' }, value: { text: 'Video call' } },
        { key: { text: 'Why are the sessions not in person?' }, value: { text: 'Travel restrictions' } },
        {
          key: { text: 'What format will you use for the sessions?' },
          value: { text: 'One-to-one session, Group session' },
        },
      ],
      [
        {
          key: { text: 'Are there any risks associated with the planned activities?' },
          value: { text: 'Yes' },
        },
        {
          key: { text: 'Details about the risks and what you will put in place to reduce them' },
          value: { text: 'Risk of harm to staff' },
        },
        {
          key: {
            text: 'Will you put any reasonable adjustments in place to help Alex take part in the planned activities?',
          },
          value: { text: 'Yes' },
        },
        {
          key: { text: 'Reasonable adjustments you will make and how this will support Alex' },
          value: { text: 'Provide a hearing loop' },
        },
      ],
      [
        {
          key: { text: 'Is the service end date still 24 May 2026?' },
          value: { text: 'No' },
        },
        { key: { text: 'What is the new service end date?' }, value: { text: '24 June 2026' } },
        {
          key: { text: 'Why are you changing the service end date?' },
          value: { text: 'The service requires more time' },
        },
      ],
      [
        { key: { text: 'Was the person involved in creating the action plan?' }, value: { text: 'Yes' } },
        { key: { text: 'What was discussed with the person?' }, value: { text: 'Their preferred session times' } },
      ],
    ])
  })
})
