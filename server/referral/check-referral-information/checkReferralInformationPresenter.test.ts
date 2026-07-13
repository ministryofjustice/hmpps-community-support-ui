import { Response } from 'express'
import { Person, ReferralInformation } from '@community-support-api'
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
    it('should render CRN and DOB when search matches the CRN regex', () => {
      const checkReferralInformation: ReferralInformation = {
        personId: 'personDetails123',
        referralId: 'referralId123',
        firstName: 'John',
        lastName: 'Doe',
        personIdentifier: 'CRN123',
        sex: 'Male',
        communityServiceProviderName: 'Community Support Service',
        region: 'London',
        deliveryPartner: 'Delivery Partner',
        referenceNumber: 'REF123',
      } as ReferralInformation

      const personDetails: Person = {
        id: 'personDetails123',
        firstName: 'John',
        lastName: 'Doe',
        personIdentifier: 'X123456',
        prisonNumbers: ['A1234BC'],
        dateOfBirth: '20 Feb 1975 (51 years old)',
        sex: 'Male',
      }

      const presenter = new CheckReferralInformationPresenter(checkReferralInformation, personDetails)
      presenter.renderPage(res)

      const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: CheckReferralInformationViewModel }

      expect(renderData.content.personalDetailsSummary.rows).toHaveLength(4)
      expect(renderData.content.personalDetailsSummary.rows[0]).toMatchObject({
        key: { text: 'Name' },
        value: { text: 'John Doe' },
      })
      expect(renderData.content.personalDetailsSummary.rows[1]).toMatchObject({
        key: { text: 'CRN' },
        value: { text: 'X123456' },
      })
      expect(renderData.content.personalDetailsSummary.rows[2]).toMatchObject({
        key: { text: 'Date of birth' },
        value: { text: '20 Feb 1975 (51 years old)' },
      })
      expect(renderData.content.personalDetailsSummary.rows[3]).toMatchObject({
        key: { text: 'Sex' },
        value: { text: 'Male' },
      })
      expect(renderData.content.backLink).toEqual({ href: '/referral/new/find-a-person' })

      expect(res.render).toHaveBeenCalledWith(
        'referral/checkReferralInformation',
        expect.objectContaining({} as CheckReferralInformationViewModel),
      )
    })

    it('should render prison number when personIdentifier matches prison number regex', () => {
      const checkReferralInformation: ReferralInformation = {
        personId: 'personDetails123',
        referralId: 'referralId123',
        firstName: 'John',
        lastName: 'Doe',
        personIdentifier: 'CRN123',
        sex: 'Male',
        communityServiceProviderName: 'Community Support Service',
        region: 'London',
        deliveryPartner: 'Delivery Partner',
        referenceNumber: 'REF123',
      } as ReferralInformation

      const personDetails: Person = {
        id: 'personDetails123',
        firstName: 'John',
        lastName: 'Doe',
        personIdentifier: 'A1234BC',
        prisonNumbers: ['A1234BC', 'B1234CD', 'C1234DE'],
        dateOfBirth: '20 Feb 1975 (51 years old)',
        sex: 'Male',
      }

      const presenter = new CheckReferralInformationPresenter(checkReferralInformation, personDetails)
      presenter.renderPage(res)

      const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: CheckReferralInformationViewModel }

      expect(renderData.content.personalDetailsSummary.rows[1]).toMatchObject({
        key: { text: 'Prison number' },
        value: { text: 'A1234BC, B1234CD, C1234DE' },
      })
    })

    it('should not render identifier row when personIdentifier format is unknown', () => {
      const checkReferralInformation: ReferralInformation = {
        personId: 'personDetails123',
        referralId: 'referralId123',
        firstName: 'John',
        lastName: 'Doe',
        personIdentifier: 'CRN123',
        sex: 'Male',
        communityServiceProviderName: 'Community Support Service',
        region: 'London',
        deliveryPartner: 'Delivery Partner',
        referenceNumber: 'REF123',
      } as ReferralInformation

      const personDetails: Person = {
        id: 'personDetails123',
        firstName: 'John',
        lastName: 'Doe',
        personIdentifier: 'UNKNOWN123',
        prisonNumbers: [],
        dateOfBirth: '20 Feb 1975 (51 years old)',
        sex: 'Male',
      }

      const presenter = new CheckReferralInformationPresenter(checkReferralInformation, personDetails)
      presenter.renderPage(res)

      const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: CheckReferralInformationViewModel }

      expect(renderData.content.personalDetailsSummary.rows).toHaveLength(3)
      expect(renderData.content.personalDetailsSummary.rows[1]).toMatchObject({
        key: { text: 'Date of birth' },
        value: { text: '20 Feb 1975 (51 years old)' },
      })
    })
  })
})
