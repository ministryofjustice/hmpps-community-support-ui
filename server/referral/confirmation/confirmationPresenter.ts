import { Referral } from '@community-support-api'

export default class ConfirmationPresenter {
  constructor(private readonly referral: Referral) {}

  get text() {
    return {
      title: `The referral has been sent`,
      referenceNumberIntro: `Your reference number`,
      referenceNumber: this.referral.referenceNumber,
      startAReferralLink: `/referral/new/select-a-service?personDetailsId=${this.referral.crn}`,
    }
  }
}
