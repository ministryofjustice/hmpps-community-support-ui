import { Response } from 'express'
import { ActionPlanSummaryDto } from '@community-support-api'
import ActionPlanPresenter from './actionPlanPresenter'
import { ActionPlanViewModel } from './actionPlanViewModel'
import { globalContent } from '../../../assets/content/GlobalContent'

describe('ActionPlanPresenter', () => {
  it('builds the page header and back link from summary data', () => {
    const actionPlanSummary: ActionPlanSummaryDto = {
      personDetails: {
        fullName: 'Alex River',
      },
      needs: [],
    }

    const presenter = new ActionPlanPresenter(actionPlanSummary, 'AB1234CD')
    const res = {
      locals: {
        content: globalContent['/referral/:id/action-plan'],
      },
      render: jest.fn(),
    } as unknown as Response

    presenter.renderPage(res)
    const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: ActionPlanViewModel }

    expect(renderData.content.pageHeader).toBe('Action plan for Alex River')
    expect(renderData.content.backLink).toEqual({ href: '/progress/AB1234CD' })
    expect(renderData.content.needsSummary.rows).toEqual([
      {
        key: { text: 'Needs' },
        value: { html: '<strong class="govuk-tag govuk-tag--blue">In progress</strong>' },
        actions: {
          items: [
            {
              href: '/referral/AB1234CD/action-plan/needs',
              text: 'Complete',
              visuallyHiddenText: 'Needs',
            },
          ],
        },
      },
    ])
  })
})
