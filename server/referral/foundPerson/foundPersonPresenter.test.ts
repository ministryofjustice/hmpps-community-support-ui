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
    it('should render the CRN row when the search matches the CRN regex', () => {
      const foundPerson: Person = {
        firstName: 'Alex',
        lastName: 'River',
        personIdentifier: 'X123456',
        prisonNumbers: ['A1234BC'],
        sex: 'Male',
        id: 'ID123',
        dateOfBirth: '20 Feb 1975 (51 years old)',
      }

      const presenter = new FoundPersonPresenter(foundPerson)
      presenter.renderPage(res)

      const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: FoundPersonViewModel }

      expect(renderData.content.personSummary.rows).toHaveLength(4)
      expect(renderData.content.personSummary.rows[0]).toMatchObject({
        key: { text: 'Name' },
        value: { text: 'Alex River' },
      })
      expect(renderData.content.personSummary.rows[1]).toMatchObject({
        key: { text: 'CRN' },
        value: { text: 'X123456' },
      })
      expect(renderData.content.personSummary.rows[2]).toMatchObject({
        key: { text: 'Date of birth' },
        value: { text: '20 Feb 1975 (51 years old)' },
      })
      expect(renderData.content.personSummary.rows[3]).toMatchObject({ key: { text: 'Sex' }, value: { text: 'Male' } })
      expect(renderData.content.backLink).toEqual({ href: '/referral/new/find-a-person' })
      expect(renderData.content.staticContent.enterDifferentIdentifierLinkText).toBe(
        'Enter a different CRN or prison number',
      )
      expect(renderData.content.staticContent.enterDifferentIdentifierLinkHref).toBe('/referral/new/find-a-person')

      expect(res.render).toHaveBeenCalledWith(
        'referral/foundPerson',
        expect.objectContaining({} as FoundPersonViewModel),
      )
    })

    it('should render the prison number row when personIdentifier matches the prison number regex', () => {
      const foundPerson: Person = {
        firstName: 'Alex',
        lastName: 'River',
        personIdentifier: 'A1234BC',
        prisonNumbers: ['A1234BC', 'B1234CD', 'C1234DE'],
        sex: 'Male',
        id: 'ID123',
        dateOfBirth: '20 Feb 1975 (51 years old)',
      }

      const presenter = new FoundPersonPresenter(foundPerson)
      presenter.renderPage(res)

      const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: FoundPersonViewModel }

      expect(renderData.content.personSummary.rows).toHaveLength(4)
      expect(renderData.content.personSummary.rows[1]).toMatchObject({
        key: { text: 'Prison number' },
        value: { text: 'A1234BC, B1234CD, C1234DE' },
      })
    })

    it('should render no identifier row when personIdentifier does not match known formats', () => {
      const foundPerson: Person = {
        firstName: 'Alex',
        lastName: 'River',
        personIdentifier: 'UNKNOWN123',
        prisonNumbers: [],
        sex: 'Male',
        id: 'ID123',
        dateOfBirth: '20 Feb 1975 (51 years old)',
      }

      const presenter = new FoundPersonPresenter(foundPerson)
      presenter.renderPage(res)

      const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: FoundPersonViewModel }

      expect(renderData.content.personSummary.rows).toHaveLength(3)
      expect(renderData.content.personSummary.rows[1]).toMatchObject({
        key: { text: 'Date of birth' },
        value: { text: '20 Feb 1975 (51 years old)' },
      })
    })

    it('should render prison number when personIdentifier is lowercase prison format', () => {
      const foundPerson: Person = {
        firstName: 'Alex',
        lastName: 'River',
        personIdentifier: 'a1234bc',
        prisonNumbers: ['A1234BC', 'B1234CD'],
        sex: 'Male',
        id: 'ID123',
        dateOfBirth: '20 Feb 1975 (51 years old)',
      }

      const presenter = new FoundPersonPresenter(foundPerson)
      presenter.renderPage(res)

      const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: FoundPersonViewModel }

      expect(renderData.content.personSummary.rows[1]).toMatchObject({
        key: { text: 'Prison number' },
        value: { text: 'A1234BC, B1234CD' },
      })
    })
  })
})
