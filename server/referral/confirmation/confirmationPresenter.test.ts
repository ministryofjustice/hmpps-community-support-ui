import ConfirmationPresenter from './confirmationPresenter'
import ReferralFactory from '../../testutils/factories/Referral'

describe(ConfirmationPresenter, () => {
  describe('text', () => {
    it('returns text to be displayed', () => {
      const referral = ReferralFactory.build()
      const presenter = new ConfirmationPresenter(referral)

      expect(presenter.text).toEqual({
        title: `The referral has been sent`,
        referenceNumberIntro: `Your reference number`,
        startAReferralLink: `/referral/new/select-a-service?personDetailsId=${referral.crn}`,
        referenceNumber: referral.referenceNumber,
      })
    })
  })
})
