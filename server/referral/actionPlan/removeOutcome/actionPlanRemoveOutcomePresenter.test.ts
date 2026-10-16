import { Response } from 'express'
import { ActionPlanSummaryDto } from '@community-support-api'
import ActionPlanRemoveOutcomePresenter from './actionPlanRemoveOutcomePresenter'
import { ActionPlanRemoveOutcomeViewModel } from './actionPlanRemoveOutcomeViewModel'
import { globalContent } from '../../../../assets/content/GlobalContent'

const need = {
  id: 'need-1',
  label: 'Accommodation',
  orderNumber: 1,
  outcomes: [
    {
      id: 'answer-outcome-1',
      label: 'I want to find suitable housing.',
      activities: [
        { id: 'activity-1', who: 'Housing service', details: 'Attend weekly sessions' },
        { id: 'activity-2', who: 'Alex', details: 'Prepare documents' },
      ],
    },
  ],
} satisfies ActionPlanSummaryDto['needs'][number]

const renderPage = () => {
  const res = {
    locals: { content: globalContent['/referral/:id/action-plan/remove-outcome'] },
    render: jest.fn(),
  } as unknown as Response

  new ActionPlanRemoveOutcomePresenter('AB1234CD', 'Alex', need, 'answer-outcome-1').renderPage(res)
  return (res.render as jest.Mock).mock.calls[0][1].content as ActionPlanRemoveOutcomeViewModel
}

describe('ActionPlanRemoveOutcomePresenter', () => {
  it('builds the personalized heading, read-only summary, inset warning and confirmation actions', () => {
    const viewModel = renderPage()

    expect(viewModel.pageHeader).toBe("Confirm you want to remove this outcome from Alex's plan")
    expect(viewModel.needSummary.card.title.text).toBe('Accommodation')
    expect(viewModel.needSummary.card.actions.items).toEqual([])
    expect(viewModel.needSummary.preText).toBe('<b>Outcome: </b>I want to find suitable housing.')
    expect(viewModel.needSummary.rows).toEqual([
      {
        key: { text: 'Who will do this', classes: 'govuk-!-font-weight-bold' },
        value: { text: 'Activity', classes: 'govuk-!-font-weight-bold' },
      },
      { key: { text: 'Housing service' }, value: { text: 'Attend weekly sessions' } },
      { key: { text: 'Alex' }, value: { text: 'Prepare documents' } },
    ])
    expect(viewModel.warningInset.text).toBe(
      'If you remove this outcome from the plan, all activities added to this outcome will also be removed.',
    )
    expect(viewModel.removeOutcomeButton).toEqual({
      text: 'Remove this outcome',
      classes: 'govuk-button--warning',
      type: 'submit',
    })
    expect(viewModel.cancelLink).toEqual({ text: 'Cancel', href: '/referral/AB1234CD/action-plan' })
    expect(viewModel.removeAction).toBe('/referral/AB1234CD/action-plan/remove-outcome')
    expect(viewModel.needId).toBe('need-1')
    expect(viewModel.outcomeAnswerId).toBe('answer-outcome-1')
  })
})
