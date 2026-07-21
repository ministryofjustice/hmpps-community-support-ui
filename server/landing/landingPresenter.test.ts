import { Response } from 'express'
import LandingPresenter from './landingPresenter'
import { LandingContent, LandingViewModel } from './landingViewModel'

describe('LandingPresenter', () => {
  it('should render the landing page template with content from res.locals.content', () => {
    const landingContent: LandingContent = {
      pageHeader: 'Community Support',
      tiles: [
        {
          heading: 'Make a referral',
          description: 'Start a new referral for Community Support services.',
          href: '/referral/new/find-a-person',
          dataTestId: 'make-referral-tile',
        },
        {
          heading: 'View cases',
          description: 'View your cases and other cases in progress.',
          href: '/cases-in-progress',
          dataTestId: 'view-cases-tile',
        },
      ],
    }

    const res = {
      locals: { content: landingContent },
      render: jest.fn(),
    } as unknown as Response

    const presenter = new LandingPresenter()
    presenter.renderPage(res)

    expect(res.render).toHaveBeenCalledWith('pages/index.njk', expect.objectContaining({} as LandingViewModel))

    const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: LandingViewModel }
    expect(renderData.content.pageHeader).toBe('Community Support')
    expect(renderData.content.tiles).toHaveLength(2)
    expect(renderData.content.tiles[0].heading).toBe('Make a referral')
    expect(renderData.content.tiles[1].heading).toBe('View cases')
  })

  it('should throw if middleware content is missing', () => {
    const res = {
      locals: { content: {} },
      render: jest.fn(),
    } as unknown as Response

    const presenter = new LandingPresenter()

    expect(() => presenter.renderPage(res)).toThrow('Landing content is missing or invalid for path /')
  })
})
