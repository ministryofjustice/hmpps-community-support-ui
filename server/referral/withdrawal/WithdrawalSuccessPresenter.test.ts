import { Response } from 'express'
import WithdrawalSuccessPresenter from './WithdrawalSuccessPresenter'

describe('WithdrawalSuccessPresenter', () => {
  let res: Response

  beforeEach(() => {
    res = {
      locals: {
        content: {
          pageHeader: 'The referral has been withdrawn',
          introText: 'You can now return to cases in progress.',
          backToCasesLink: '/cases-in-progress',
          backToCasesLinkText: 'Go to case list',
        },
      },
      render: jest.fn(),
    } as unknown as Response
  })

  it('renders the withdrawal success page with the expected content', () => {
    const presenter = new WithdrawalSuccessPresenter()

    presenter.renderPage(res)

    expect(res.render).toHaveBeenCalledWith(
      'referral/withdrawal/success',
      expect.objectContaining({
        pageHeader: 'The referral has been withdrawn',
        introText: 'You can now return to cases in progress.',
        backToCasesLink: '/cases-in-progress',
        backToCasesLinkText: 'Go to case list',
        panel: expect.objectContaining({
          titleText: 'The referral has been withdrawn',
        }),
      }),
    )
  })
})
