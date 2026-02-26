import { Response } from 'express'
import { ReferralInformation } from '@community-support-api'
import type {
  CheckReferralInformationContent,
  CheckReferralInformationViewModel,
} from './checkReferralInformationViewModel'
import CheckReferralInformationPresenter from './checkReferralInformationPresenter'
import CheckReferralInformationContentFactory from '../../testutils/factories/CheckReferralInformationContent'

describe('CheckReferralInformationPresenter', () => {
  let res: Response
  let content: CheckReferralInformationContent
  beforeEach(() => {
    content = CheckReferralInformationContentFactory.build()
    res = {
      locals: { content },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response
  })
  describe('renderPage', () => {
    it('should render the check referral information page with the correct content and summary list', () => {
      const CheckReferralInformation: ReferralInformation = {
        personId: 'personDetails123',
        referralId: 'referralId123',
        firstName: 'John',
        lastName: 'Doe',
        crn: 'CRN123',
        sex: 'Male',
        communityServiceProviderName: 'Community Support Service',
        region: 'London',
        deliveryPartner: 'Delivery Partner',
        referenceNumber: 'REF123',
      } as ReferralInformation
      const presenter = new CheckReferralInformationPresenter(CheckReferralInformation)
      presenter.renderPage(res)
      expect(res.render).toHaveBeenCalledWith(
        'referral/checkReferralInformation',
        expect.objectContaining({} as CheckReferralInformationViewModel),
      )
    })
  })
})
