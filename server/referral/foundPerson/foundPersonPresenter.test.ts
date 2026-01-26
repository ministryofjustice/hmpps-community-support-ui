import { Response } from 'express'
import { Person } from '@community-support-api'
import { type FoundPersonContent } from './foundPersonViewModel'
import FoundPersonPresenter from './foundPersonPresenter'
import FoundPersonContentFactory from '../../testutils/factories/FoundPersonContent'

describe('FoundPersonPresenter', () => {
  let res: Response
  let content: FoundPersonContent
  beforeEach(() => {
    content = FoundPersonContentFactory.build()
    res = {
      locals: { content },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response
  })
  describe('buildPageContent', () => {
    it('returns view model to be displayed', () => {
      const foundPerson = {
        personIdentifier: 'X123456',
        firstName: 'John',
        lastName: 'Doe',
        sex: 'Male',
      } as Person
      const presenter = new FoundPersonPresenter(foundPerson)
      const pageContent = presenter.buildPageContent(res)
      expect(pageContent.staticContent.pageHeader).toBe('Confirm this is the correct person for referral')
      expect(pageContent.staticContent.continueButtonText).toBe('Continue')
      expect(pageContent.staticContent.continueButtonLink).toBe('/referral/new/select-a-service')
    })
  })
})
