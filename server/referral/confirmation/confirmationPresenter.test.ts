import { Response } from 'express'
import { ReferralInformationDto } from '@community-support-api'
import type { ReferralConfirmationContent, ReferralConfirmationViewModel } from './confirmationViewModel'
import ConfirmationPresenter from './confirmationPresenter'
import ConfirmationContentFactory from '../../testutils/factories/ConfirmationContent'

describe('confirmationPresenter', () => {
  let res: Response
  let content: ReferralConfirmationContent
  beforeEach(() => {
    content = ConfirmationContentFactory.build()
    res = {
      locals: { content },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response
  })
  describe('renderPage', () => {
    it('should render the found person page with the correct content and summary list', () => {
      const confirmation: ReferralInformationDto = {} as unknown as ReferralInformationDto
      const presenter = new ConfirmationPresenter(confirmation)
      presenter.renderPage(res)
      expect(res.render).toHaveBeenCalledWith(
        'referral/confirmation',
        expect.objectContaining({} as ReferralConfirmationViewModel),
      )
    })
  })
})
