import { Response } from 'express'
import NeedsPresenter from './needsPresenter'
import { NeedsViewModel } from './needsViewModel'

describe('NeedsPresenter', () => {
  it('builds the page header and back link', () => {
    const presenter = new NeedsPresenter('AB1234CD')
    const res = {
      locals: {
        content: {
          pageHeader: 'Needs',
        },
      },
      render: jest.fn(),
    } as unknown as Response

    presenter.renderPage(res)
    const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: NeedsViewModel }

    expect(renderData.content.pageHeader).toBe('Needs')
    expect(renderData.content.backLink).toEqual({ href: '/referral/AB1234CD/action-plan' })
  })
})
