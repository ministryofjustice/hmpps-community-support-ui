import { Response } from 'express'
import WithdrawalAlreadyWithdrawnPresenter from './WithdrawalAlreadyWithdrawnPresenter'

describe('WithdrawalAlreadyWithdrawnPresenter', () => {
  let res: Response

  beforeEach(() => {
    res = {
      locals: {
        content: {
          pageHeader: 'Unable to withdraw referral',
          errorMessage: 'This referral has already been withdrawn by another user',
          backToCasesLink: '/cases-in-progress',
          backToCasesLinkText: 'Back to cases in progress',
        },
      },
      render: jest.fn(),
    } as unknown as Response
  })

  it('renders the withdrawal error page with the expected content', () => {
    const presenter = new WithdrawalAlreadyWithdrawnPresenter()

    presenter.renderPage(res)

    expect(res.render).toHaveBeenCalledWith(
      'referral/withdrawal/error',
      expect.objectContaining({
        pageHeader: 'Unable to withdraw referral',
        errorMessage: 'This referral has already been withdrawn by another user',
        backToCasesLink: '/cases-in-progress',
        backToCasesLinkText: 'Back to cases in progress',
      }),
    )
  })
})
