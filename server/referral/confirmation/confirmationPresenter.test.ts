import ConfirmationPresenter from './confirmationPresenter'
import ReferralFactory from '../../testutils/factories/Referral'

describe(ConfirmationPresenter, () => {
  describe('buildPageContent', () => {
    it('returns viewmodel to be rendered', () => {
      const referral = ReferralFactory.build()
      const presenter = new ConfirmationPresenter({}, referral)
      const viewModel = {
        title: 'The referral has been sent',
        referenceNumberIntro: 'Your reference number',
        referenceNumber: referral.referenceNumber,
        startAReferralLink: `/referral/new/select-a-service?personDetailsId=${referral.crn}`,
      }

      expect(presenter.buildPageContent()).toEqual(viewModel)
    })
  })
})
