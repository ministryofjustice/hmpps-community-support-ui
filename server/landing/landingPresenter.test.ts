import { Response } from 'express'
import LandingPresenter from './landingPresenter'
import { globalContent } from '../../assets/content/GlobalContent'

describe('LandingPresenter', () => {
  it('renders the landing page using global content without middleware content', () => {
    const res = {
      render: jest.fn(),
    } as unknown as Response

    const presenter = new LandingPresenter()
    presenter.renderPage(res)

    expect(res.render).toHaveBeenCalledWith('pages/index.njk', { content: globalContent['/'] })
  })

  it('ignores stale middleware content', () => {
    const res = {
      locals: { content: {} },
      render: jest.fn(),
    } as unknown as Response

    const presenter = new LandingPresenter()

    presenter.renderPage(res)
    expect(res.render).toHaveBeenCalledWith('pages/index.njk', { content: globalContent['/'] })
  })
})
