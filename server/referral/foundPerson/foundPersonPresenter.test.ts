import { Response } from 'express'
import type { FoundPersonContent, FoundPersonViewModel } from './foundPersonViewModel'
import FoundPersonPresenter from './foundPersonPresenter'
import FoundPersonContentFactory from '../../testutils/factories/FoundPersonContent'
import PersonFactory from '../../testutils/factories/Person'

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
    it('should render the correct details for a valid person', () => {
      const foundPerson = PersonFactory.build()

      const presenter = new FoundPersonPresenter(foundPerson)
      presenter.renderPage(res)

      const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: FoundPersonViewModel }

      expect(renderData.content.personSummary.rows).toHaveLength(7)
      expect(renderData.content.personSummary.card.title.text).toEqual('Personal details')
      expect(renderData.content.personSummary.rows[0]).toMatchObject({
        key: { text: 'Name' },
        value: { text: 'Alex River' },
      })
      expect(renderData.content.personSummary.rows[1]).toMatchObject({
        key: { text: 'CRN' },
        value: { text: 'X123456' },
      })
      expect(renderData.content.personSummary.rows[2]).toMatchObject({
        key: { text: 'Current location' },
        value: { text: 'Not available' },
      })
      expect(renderData.content.personSummary.rows[3]).toMatchObject({
        key: { text: 'Date of birth' },
        value: { text: '20 Feb 1975 (51 years old)' },
      })
      expect(renderData.content.personSummary.rows[4]).toMatchObject({
        key: { text: 'Preferred language' },
        value: { text: 'English' },
      })
      expect(renderData.content.personSummary.rows[5].key.html)
        .toContain('Current circumstances')
      expect(renderData.content.personSummary.rows[5].key.html)
        .toContain('Last updated: 3 January 2020')
      expect(renderData.content.personSummary.rows[5].value.html)
        .toContain('Relationship: Married / Civil Partnership')
      expect(renderData.content.personSummary.rows[5].value.html).toContain('Employment: Full Time Employed')
      expect(renderData.content.personSummary.rows[5].value.html)
        .toContain('Dependants: Has Dependants')

      expect(renderData.content.personSummary.rows[6].key.html)
        .toContain('Disabilities')
      expect(renderData.content.personSummary.rows[6].key.html)
        .toContain('Last updated: 4 January 2020')
      expect(renderData.content.personSummary.rows[6].value.html)
        .toContain('Neurodiverse conditions')

      expect(renderData.content.equalityMonitoring.rows).toHaveLength(4)
      expect(renderData.content.equalityMonitoring.card.title.text).toEqual('Equality monitoring')
      expect(renderData.content.equalityMonitoring.rows[0]).toMatchObject({
        key: { text: 'Nationality' },
        value: { text: 'Argentine, Brazilian' },
      })
      expect(renderData.content.equalityMonitoring.rows[1]).toMatchObject({
        key: { text: 'Ethnicity' },
        value: { text: 'White: British/English/Welsh/Scottish/Northern Irish' },
      })
      expect(renderData.content.equalityMonitoring.rows[2]).toMatchObject({
        key: { text: 'Religion or belief' },
        value: { text: 'No religion' },
      })
      expect(renderData.content.equalityMonitoring.rows[3]).toMatchObject({
        key: { text: 'Sex' },
        value: { text: 'Male' },
      })

      expect(renderData.content.additionalInformation.rows).toHaveLength(2)
      expect(renderData.content.additionalInformation.card.title.text).toEqual('Additional information')
      expect(renderData.content.additionalInformation.rows[0].key.text)
        .toEqual('Home Office Interest')
      expect(renderData.content.additionalInformation.rows[0].value.html)
        .toContain('Yes')
      expect(renderData.content.additionalInformation.rows[0].value.html)
        .toContain('Claiming asylum from Iran')

      expect(renderData.content.additionalInformation.rows[1]).toMatchObject({
        key: { text: 'Offender personality disorder (OPD) pathway' },
        value: { text: 'Yes' },
      })

      expect(renderData.content.contactDetails.rows).toHaveLength(4)
      expect(renderData.content.contactDetails.card.title.text).toEqual('Contact details')
      expect(renderData.content.contactDetails.rows[0]).toMatchObject({
        key: { text: 'Phone number' },
        value: { text: '01234567890' },
      })
      expect(renderData.content.contactDetails.rows[1]).toMatchObject({
        key: { text: 'Mobile number' },
        value: { text: '09876543210' },
      })
      expect(renderData.content.contactDetails.rows[2]).toMatchObject({
        key: { text: 'Email address' },
        value: { text: 'alex.river@test.com' },
      })
      expect(renderData.content.contactDetails.rows[3]).toMatchObject({
        key: {
          html: '<b>Main address</b>\n<div class="govuk-hint govuk-!-font-size-16">Last updated: Not available</div>',
        },
        value: {
          html:
            '<div>Derwent Centre, 1 Stuart Street, Derby, DE1 2EQ</div>\n' +
            '<br/>\n' +
            '<div class="govuk-summary-list__key">Type of address</div>\n' +
            '<div>Main residence</div>\n' +
            '<br/>\n' +
            '<div class="govuk-summary-list__key">Start date</div>\n' +
            '<div>1 January 2026</div>\n' +
            '<br/>\n' +
            '<div class="govuk-summary-list__key">Notes</div>\n' +
            '<div>No notes</div>',
        },
      })

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

    it('should render the CRN row when the search matches the CRN regex', () => {
      const foundPerson = PersonFactory.build()

      const presenter = new FoundPersonPresenter(foundPerson)
      presenter.renderPage(res)

      const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: FoundPersonViewModel }

      expect(renderData.content.personSummary.rows).toHaveLength(7)
      expect(renderData.content.personSummary.rows[1]).toMatchObject({
        key: { text: 'CRN' },
        value: { text: 'X123456' },
      })
    })

    it('should render the prison number row when personIdentifier matches the prison number regex', () => {
      const foundPerson = PersonFactory.build({
        personIdentifier: 'A1234BC',
        prisonNumbers: ['A1234BC', 'B1234CD', 'C1234DE'],
      })

      const presenter = new FoundPersonPresenter(foundPerson)
      presenter.renderPage(res)

      const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: FoundPersonViewModel }

      expect(renderData.content.personSummary.rows).toHaveLength(7)
      expect(renderData.content.personSummary.rows[1]).toMatchObject({
        key: { text: 'Prison number' },
        value: { text: 'A1234BC, B1234CD, C1234DE' },
      })
    })

    it('should render no identifier row when personIdentifier does not match known formats', () => {
      const foundPerson = PersonFactory.build({
        personIdentifier: 'UNKNOWN123',
        prisonNumbers: [],
      })

      const presenter = new FoundPersonPresenter(foundPerson)
      presenter.renderPage(res)

      const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: FoundPersonViewModel }

      expect(renderData.content.personSummary.rows).toHaveLength(6)
      expect(renderData.content.personSummary.rows[2]).toMatchObject({
        key: { text: 'Date of birth' },
        value: { text: '20 Feb 1975 (51 years old)' },
      })
    })

    it('should render prison number when personIdentifier is lowercase prison format', () => {
      const foundPerson = PersonFactory.build({
        personIdentifier: 'a1234bc',
        prisonNumbers: ['A1234BC', 'B1234CD'],
      })

      const presenter = new FoundPersonPresenter(foundPerson)
      presenter.renderPage(res)

      const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: FoundPersonViewModel }

      expect(renderData.content.personSummary.rows[1]).toMatchObject({
        key: { text: 'Prison number' },
        value: { text: 'A1234BC, B1234CD' },
      })
    })

    it('should render Not available if person has no disabilities', () => {
      const foundPerson = PersonFactory.build({
        personDetailsAndCircumstances: {
          disabilities: [],
        },
      })

      const presenter = new FoundPersonPresenter(foundPerson)
      presenter.renderPage(res)

      const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: FoundPersonViewModel }

      expect(renderData.content.personSummary.rows).toHaveLength(7)
      expect(renderData.content.personSummary.rows[6]).toMatchObject({
        key: {
          html: '<b>Disabilities</b>\n<div class="govuk-hint govuk-!-font-size-16">Last updated: Not available</div>',
        },
        value: { html: 'Not available' },
      })
    })

    it('should not render offender personality disorder row if not present', () => {
      const foundPerson = PersonFactory.build({
        personDetailsAndCircumstances: {
          offenderPersonalityDisorder: null,
        },
      })

      const presenter = new FoundPersonPresenter(foundPerson)
      presenter.renderPage(res)

      const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: FoundPersonViewModel }

      expect(renderData.content.additionalInformation.rows).toHaveLength(1)
      expect(renderData.content.additionalInformation.rows[0].key.text)
        .toEqual('Home Office Interest')
      expect(renderData.content.additionalInformation.rows[0].value.html)
        .toContain('Yes')
      expect(renderData.content.additionalInformation.rows[0].value.html)
        .toContain('Claiming asylum from Iran')
    })

    it('should not render home office interest row if not present', () => {
      const foundPerson = PersonFactory.build({
        personDetailsAndCircumstances: {
          ofHomeOfficeInterest: false,
        },
      })

      const presenter = new FoundPersonPresenter(foundPerson)
      presenter.renderPage(res)

      const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: FoundPersonViewModel }

      expect(renderData.content.additionalInformation.rows).toHaveLength(1)
      expect(renderData.content.additionalInformation.rows[0]).toMatchObject({
        key: { text: 'Offender personality disorder (OPD) pathway' },
        value: { text: 'Yes' },
      })
    })

    it('should not render additional details card if info not present', () => {
      const foundPerson = PersonFactory.build({
        personDetailsAndCircumstances: {
          offenderPersonalityDisorder: null,
          ofHomeOfficeInterest: false,
        },
      })

      const presenter = new FoundPersonPresenter(foundPerson)
      presenter.renderPage(res)

      const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: FoundPersonViewModel }

      expect(renderData.content.additionalInformation).toBeUndefined()
    })

    it('should render address correctly if person is in custody', () => {
      const foundPerson = PersonFactory.build({
        personIdentifier: 'A0216ED',
      })

      const presenter = new FoundPersonPresenter(foundPerson)
      presenter.renderPage(res)

      const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: FoundPersonViewModel }

      expect(renderData.content.contactDetails.rows[3].key.html)
        .toContain('Last known address')
      expect(renderData.content.contactDetails.rows[3].key.html)
        .toContain('Last updated: Not available')
      expect(renderData.content.contactDetails.rows[3].value.html)
        .toContain('Derwent Centre, 1 Stuart Street, Derby, DE1 2EQ')
      expect(renderData.content.contactDetails.rows[3].value.html).toContain('Type of address')
      expect(renderData.content.contactDetails.rows[3].value.html).toContain('Main residence')
      expect(renderData.content.contactDetails.rows[3].value.html).toContain('Start date')
      expect(renderData.content.contactDetails.rows[3].value.html).toContain('1 January 2026')
      expect(renderData.content.contactDetails.rows[3].value.html).toContain('Notes')
      expect(renderData.content.contactDetails.rows[3].value.html)
        .toContain('No notes')
    })
  })
})
