import { Response } from 'express'
import { Person } from '@community-support-api'
import type { FoundPersonContent, FoundPersonViewModel } from './foundPersonViewModel'
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
  describe('renderPage', () => {
    it('should render the found person page with the correct content and summary list', () => {
      const foundPerson: Person = {
        firstName: 'John',
        lastName: 'Doe',
        personIdentifier: 'CRN123',
        sex: 'Male',
        id: 'ID123',
        dateOfBirth: '1990-01-01',
      }
      const presenter = new FoundPersonPresenter(foundPerson)
      presenter.renderPage(res)
      expect(res.render).toHaveBeenCalledWith(
        'referral/foundPerson',
        expect.objectContaining({} as FoundPersonViewModel),
      )
    })
  })
})
