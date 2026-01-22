import CheckReferralInformationPresenter from './checkReferralInformationPresenter'

describe(CheckReferralInformationPresenter, () => {
  describe('text', () => {
    it('returns text to be displayed', () => {
      const referralInformationDto = {
        crn: 'CRN123',
        firstName: 'John',
        lastName: 'Doe',
        sex: 'Male',
        personId: 'person-id-123',
        referralId: 'referral-id-123',
        communityServiceProviderId: 'csp-id-123',
        communityServiceProviderName: 'Community Support Provider',
        region: 'North West',
        deliveryPartner: 'Delivery Partner Ltd',
      }
      const presenter = new CheckReferralInformationPresenter(referralInformationDto)
      expect(presenter.text).toEqual({
        title: 'Check referral information',
        buttonText: 'Submit referral',
      })
      expect(presenter.personalDetailsSummary).toEqual({
        card: {
          title: {
            text: 'Personal details',
          },
        },
        rows: [
          {
            key: { text: 'Name' },
            value: { text: 'John Doe' },
          },
          {
            key: { text: 'CRN' },
            value: { text: 'CRN123' },
          },
          { key: { text: 'Sex' }, value: { text: 'Male' } },
        ],
      })
      expect(presenter.referralDetailsSummary).toEqual({
        card: {
          title: {
            text: 'Referral details',
          },
        },
        rows: [
          {
            key: { text: 'Community Support Service' },
            value: { text: 'Community Support Provider' },
          },
          {
            key: { text: 'Location' },
            value: { text: 'North West' },
          },
          {
            key: { text: 'Delivery Partner' },
            value: { text: 'Delivery Partner Ltd' },
          },
        ],
      })
    })
  })
})
