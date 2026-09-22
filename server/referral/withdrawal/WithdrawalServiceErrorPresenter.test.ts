import { Response } from 'express'
import WithdrawalServiceErrorPresenter from './WithdrawalServiceErrorPresenter'

describe('WithdrawalServiceErrorPresenter', () => {
  let res: Response

  beforeEach(() => {
    res = {
      locals: {
        content: {
          pageHeader: 'Sorry, there is a problem with this service',
          message: 'Try again later.',
          goToCaseListLink: '/cases-in-progress',
          goToCaseListButtonText: 'Go to case list',
        },
      },
      render: jest.fn(),
    } as unknown as Response
  })

  it('renders the service error page with the expected content', () => {
    const presenter = new WithdrawalServiceErrorPresenter()

    presenter.renderPage(res)

    expect(res.render).toHaveBeenCalledWith(
      'referral/withdrawal/serviceError',
      expect.objectContaining({
        pageHeader: 'Sorry, there is a problem with this service',
        message: 'Try again later.',
        goToCaseListLink: '/cases-in-progress',
        goToCaseListButtonText: 'Go to case list',
      }),
    )
  })
})
