import { ReferralInformationDto } from '@community-support-api'
import { GovukFrontendSummaryList } from '@govuk-frontend'

export default class CheckReferralInformationPresenter {
  constructor(private readonly referralInformation: ReferralInformationDto) {}

  get text() {
    return {
      title: 'Check referral information',
      buttonText: 'Submit referral',
    }
  }

  get submitHref(): string {
    return `/referral/${this.referralInformation.referralId}/submit-referral-information`
  }

  get personalDetailsSummary(): GovukFrontendSummaryList {
    const summary = [
      {
        key: { text: 'Name' },
        value: { text: `${this.referralInformation.firstName} ${this.referralInformation.lastName}` },
      },
      {
        key: { text: 'CRN' },
        value: { text: this.referralInformation.crn },
      },
      {
        key: { text: 'Sex' },
        value: { text: this.referralInformation.sex },
      },
    ]
    return {
      card: {
        title: {
          text: 'Personal details',
        },
      },
      rows: summary,
    }
  }

  get referralDetailsSummary(): GovukFrontendSummaryList {
    const summary = [
      {
        key: { text: 'Community Support Service' },
        value: { text: this.referralInformation.communityServiceProviderName },
      },
      {
        key: { text: 'Location' },
        value: { text: this.referralInformation.region },
      },
      {
        key: { text: 'Delivery Partner' },
        value: { text: this.referralInformation.deliveryPartner },
      },
    ]
    return {
      card: {
        title: {
          text: 'Referral details',
        },
      },
      rows: summary,
    }
  }
}
