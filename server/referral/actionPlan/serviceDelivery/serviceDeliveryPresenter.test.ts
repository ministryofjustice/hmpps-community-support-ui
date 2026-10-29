import { Response } from 'express'
import { ActionPlanSessionDeliveryDetailsResponse } from '@community-support-api'
import ServiceDeliveryPresenter from './serviceDeliveryPresenter'
import { ServiceDeliveryViewModel } from './serviceDeliveryViewModel'
import { globalContent } from '../../../../assets/content/GlobalContent'
import { ActionPlanCheckYourAnswersDetails } from '../../../services/referralService'

type Question = ActionPlanSessionDeliveryDetailsResponse['questions'][number]

describe('ServiceDeliveryPresenter', () => {
  const content = { ...globalContent['/referral/:id'], ...globalContent['/referral/:id/service-delivery'] }

  const buildQuestion = (overrides: Partial<Question> = {}): Question => ({
    id: 'question-1',
    displayOrder: 1,
    label: 'How often will sessions take place?',
    key: 'SESSION_FREQUENCY',
    hint: null,
    answerType: 'TEXTAREA',
    maximumNumberOfResponses: 1,
    choices: null,
    savedResponses: [],
    ...overrides,
  })

  const buildDetails = (
    overrides: Partial<ActionPlanCheckYourAnswersDetails> = {},
  ): ActionPlanCheckYourAnswersDetails => ({
    sessionDetails: { questions: [] },
    risksAndAdjustments: { questions: [] },
    serviceEndDate: { questions: [] },
    personInvolvement: { questions: [] },
    ...overrides,
  })

  const render = (caseReference = 'AB1234CD', details: ActionPlanCheckYourAnswersDetails = buildDetails()) => {
    const res = { locals: { content }, render: jest.fn() } as unknown as Response
    new ServiceDeliveryPresenter(caseReference, details).renderPage(res)
    const [template, data] = (res.render as jest.Mock).mock.calls[0] as [string, { content: ServiceDeliveryViewModel }]
    return { template, viewModel: data.content }
  }

  it('renders the service delivery template', () => {
    expect(render().template).toBe('referral/serviceDelivery')
  })

  it('builds the page header and back link', () => {
    const { viewModel } = render()

    expect(viewModel.pageHeader).toBe('Action plan')
    expect(viewModel.backLink).toEqual({ href: '/progress/AB1234CD' })
  })

  it('builds the add another outcome button for the referral', () => {
    const { viewModel } = render()

    expect(viewModel.addAnotherOutcomeButton).toEqual({
      href: '/referral/AB1234CD/action-plan/select-a-need',
      text: 'Add another outcome',
      classes: 'govuk-button--secondary govuk-!-margin-right-2',
    })
  })

  it('builds the referral sub navigation', () => {
    const { viewModel } = render()

    expect(viewModel.subNavigationArgs).toEqual({
      label: 'Sub navigation',
      items: [{ href: '/referral/AB1234CD/action-plan', text: 'Action plan', active: true }],
    })
  })

  it('builds the side navigation with the service delivery item active', () => {
    const { viewModel } = render()

    expect(viewModel.horizontalSubNavArgs).toEqual({
      label: 'Side navigation',
      items: [
        { href: '/referral/AB1234CD/action-plan', text: 'Action plan', active: false },
        { href: '/referral/AB1234CD/service-delivery', text: 'Service details', active: true },
      ],
    })
  })

  it('uses the referral id in every link', () => {
    const { viewModel } = render('ZZ9876YY')

    expect(viewModel.horizontalSubNavArgs.items.map(item => item.href)).toEqual([
      '/referral/ZZ9876YY/action-plan',
      '/referral/ZZ9876YY/service-delivery',
    ])
  })

  describe('summary cards', () => {
    it('titles each card from the content and leaves them empty when there are no answers', () => {
      const { viewModel } = render()

      expect(viewModel.serviceDeliverySummaryCard).toEqual({ card: { title: { text: 'Service delivery' } }, rows: [] })
      expect(viewModel.risksAndAdjustmentsSummaryCard).toEqual({
        card: { title: { text: 'Risks and adjustments' } },
        rows: [],
      })
      expect(viewModel.serviceEndDateSummaryCard).toEqual({
        card: { title: { text: 'Service end date' } },
        rows: [],
      })
    })

    it('builds each card from its own section of the answers', () => {
      const { viewModel } = render(
        'AB1234CD',
        buildDetails({
          sessionDetails: {
            questions: [buildQuestion({ label: 'Frequency', savedResponses: [{ value: 'Weekly' }] })],
          },
          risksAndAdjustments: {
            questions: [buildQuestion({ label: 'Risks', savedResponses: [{ value: 'Some risk' }] })],
          },
          serviceEndDate: {
            questions: [buildQuestion({ label: 'End date', savedResponses: [{ value: 'Soon' }] })],
          },
        }),
      )

      expect(viewModel.serviceDeliverySummaryCard.rows).toEqual([
        { key: { text: 'Frequency' }, value: { text: 'Weekly' } },
      ])
      expect(viewModel.risksAndAdjustmentsSummaryCard.rows).toEqual([
        { key: { text: 'Risks' }, value: { text: 'Some risk' } },
      ])
      expect(viewModel.serviceEndDateSummaryCard.rows).toEqual([{ key: { text: 'End date' }, value: { text: 'Soon' } }])
    })

    it('shows free text answers as entered', () => {
      const { viewModel } = render(
        'AB1234CD',
        buildDetails({
          sessionDetails: { questions: [buildQuestion({ savedResponses: [{ value: 'Every 2 weeks' }] })] },
        }),
      )

      expect(viewModel.serviceDeliverySummaryCard.rows).toEqual([
        { key: { text: 'How often will sessions take place?' }, value: { text: 'Every 2 weeks' } },
      ])
    })

    it('shows the choice label rather than the stored value', () => {
      const question = buildQuestion({
        label: 'How will the sessions take place?',
        answerType: 'RADIO',
        choices: [
          { value: 'IN_PERSON', label: 'In person', displayOrder: 1, displayAdditionalDetailsOnSelect: false },
          { value: 'VIDEO_CALL', label: 'Video call', displayOrder: 2, displayAdditionalDetailsOnSelect: false },
        ],
        savedResponses: [{ value: 'VIDEO_CALL' }],
      })

      const { viewModel } = render('AB1234CD', buildDetails({ sessionDetails: { questions: [question] } }))

      expect(viewModel.serviceDeliverySummaryCard.rows).toEqual([
        { key: { text: 'How will the sessions take place?' }, value: { text: 'Video call' } },
      ])
    })

    it('joins several saved choices into one comma separated value', () => {
      const question = buildQuestion({
        label: 'What format will you use?',
        answerType: 'CHECKBOX',
        maximumNumberOfResponses: 2,
        choices: [
          { value: 'ONE', label: 'One-to-one session', displayOrder: 1, displayAdditionalDetailsOnSelect: false },
          { value: 'GROUP', label: 'Group session', displayOrder: 2, displayAdditionalDetailsOnSelect: false },
        ],
        savedResponses: [{ value: 'ONE' }, { value: 'GROUP' }],
      })

      const { viewModel } = render('AB1234CD', buildDetails({ sessionDetails: { questions: [question] } }))

      expect(viewModel.serviceDeliverySummaryCard.rows).toEqual([
        { key: { text: 'What format will you use?' }, value: { text: 'One-to-one session, Group session' } },
      ])
    })

    it('omits a question that has no saved response', () => {
      const { viewModel } = render(
        'AB1234CD',
        buildDetails({ sessionDetails: { questions: [buildQuestion({ savedResponses: [] })] } }),
      )

      expect(viewModel.serviceDeliverySummaryCard.rows).toEqual([])
    })

    describe('additional details', () => {
      const buildChoiceQuestion = (choiceOverrides: Partial<Question['choices'][number]>) =>
        buildQuestion({
          label: 'How will the sessions take place?',
          answerType: 'RADIO',
          choices: [
            {
              value: 'VIDEO_CALL',
              label: 'Video call',
              displayOrder: 1,
              displayAdditionalDetailsOnSelect: true,
              additionalDetailsLabel: 'Why are the sessions not in person?',
              ...choiceOverrides,
            },
          ],
          savedResponses: [{ value: 'VIDEO_CALL', additionalDetails: 'Travel restrictions' }],
        })

      it('adds a row keyed by the additional details label', () => {
        const { viewModel } = render(
          'AB1234CD',
          buildDetails({ sessionDetails: { questions: [buildChoiceQuestion({})] } }),
        )

        expect(viewModel.serviceDeliverySummaryCard.rows).toEqual([
          { key: { text: 'How will the sessions take place?' }, value: { text: 'Video call' } },
          { key: { text: 'Why are the sessions not in person?' }, value: { text: 'Travel restrictions' } },
        ])
      })

      it('prefers the additional details hint over the label for the row key', () => {
        const { viewModel } = render(
          'AB1234CD',
          buildDetails({
            sessionDetails: {
              questions: [buildChoiceQuestion({ additionalDetailsHint: 'Reason for remote sessions' })],
            },
          }),
        )

        expect(viewModel.serviceDeliverySummaryCard.rows[1]).toEqual({
          key: { text: 'Reason for remote sessions' },
          value: { text: 'Travel restrictions' },
        })
      })

      it('does not add a row when the choice does not display additional details', () => {
        const { viewModel } = render(
          'AB1234CD',
          buildDetails({
            sessionDetails: { questions: [buildChoiceQuestion({ displayAdditionalDetailsOnSelect: false })] },
          }),
        )

        expect(viewModel.serviceDeliverySummaryCard.rows).toHaveLength(1)
      })

      it('does not add a row when there are no saved additional details', () => {
        const question = buildChoiceQuestion({})
        question.savedResponses = [{ value: 'VIDEO_CALL', additionalDetails: null }]

        const { viewModel } = render('AB1234CD', buildDetails({ sessionDetails: { questions: [question] } }))

        expect(viewModel.serviceDeliverySummaryCard.rows).toHaveLength(1)
      })
    })

    describe('date answers', () => {
      const dateQuestion = (value: string) =>
        buildQuestion({ label: 'New service end date', answerType: 'DATE', savedResponses: [{ value }] })

      it('formats a valid ISO date', () => {
        const { viewModel } = render(
          'AB1234CD',
          buildDetails({ serviceEndDate: { questions: [dateQuestion('2026-05-24')] } }),
        )

        expect(viewModel.serviceEndDateSummaryCard.rows).toEqual([
          { key: { text: 'New service end date' }, value: { text: '24 May 2026' } },
        ])
      })

      it('shows the raw value when the date is not valid', () => {
        const { viewModel } = render(
          'AB1234CD',
          buildDetails({ serviceEndDate: { questions: [dateQuestion('not-a-date')] } }),
        )

        expect(viewModel.serviceEndDateSummaryCard.rows).toEqual([
          { key: { text: 'New service end date' }, value: { text: 'not-a-date' } },
        ])
      })
    })
  })
})
