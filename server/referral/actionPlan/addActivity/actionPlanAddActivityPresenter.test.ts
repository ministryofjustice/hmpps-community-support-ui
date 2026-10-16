import { Response } from 'express'
import ActionPlanAddActivityPresenter from './actionPlanAddActivityPresenter'
import { ActionPlanAddActivityViewModel } from './actionPlanAddActivityViewModel'
import { globalContent } from '../../../../assets/content/GlobalContent'

describe('ActionPlanAddActivityPresenter', () => {
  const render = (backLink?: string) => {
    const res = {
      locals: { content: globalContent['/referral/:id/action-plan/activities/add'] },
      render: jest.fn(),
    } as unknown as Response

    new ActionPlanAddActivityPresenter(
      'AB1234CD',
      'Accommodation',
      'Find housing',
      undefined,
      undefined,
      undefined,
      backLink,
    ).renderPage(res)

    return (res.render as jest.Mock).mock.calls[0][1].content as ActionPlanAddActivityViewModel
  }

  it('builds the default back link from static content with the case reference', () => {
    expect(render().backLink).toEqual({ href: '/referral/AB1234CD/action-plan/activities' })
  })

  it('uses the supplied back link instead of the default', () => {
    const backLink = '/referral/AB1234CD/action-plan/select-a-need'

    expect(render(backLink).backLink).toEqual({ href: backLink })
  })
})
