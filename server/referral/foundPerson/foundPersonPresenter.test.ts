import FoundPersonPresenter from './foundPersonPresenter'

describe('FoundPersonPresenter', () => {
  describe('buildPageContent', () => {
    it('returns view model to be displayed', () => {
      const foundPerson = {
        personIdentifier: 'X123456',
        firstName: 'John',
        lastName: 'Doe',
        sex: 'Male',
      }
      const presenter = new FoundPersonPresenter({}, foundPerson)
      const content = presenter.buildPageContent()
      expect(content.pageHeader).toBe('Confirm this is the correct person for referral')
      expect(content.continueButtonText).toBe('Continue')
      expect(content.continueButtonLink).toBe('/referral/create-referral/X123456')
    })
  })
})
