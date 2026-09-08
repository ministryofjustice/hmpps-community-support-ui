import nunjucks from 'nunjucks'
import path from 'path'
import { Response } from 'express'
import { IssuesOrConcernsContent, IssuesOrConcernsViewModel } from './IssuesOrConcernsViewModel'
import IcsFeedbackIssuesOrConcernsFactory from '../../testutils/factories/IcsFeedbackIssuesOrConcerns'
import IssuesOrConcernsPresenter from './IssuesOrConcernsPresenter'

beforeAll(() => {
  nunjucks.configure([
    path.join(__dirname, '../../views'),
    path.join(process.cwd(), 'node_modules/govuk-frontend/dist/'),
    path.join(process.cwd(), 'node_modules/@ministryofjustice/frontend/'),
  ])
})

describe('IssuesOrConcernsPresenter', () => {
  let res: Response
  let content: IssuesOrConcernsContent

  beforeEach(() => {
    content = IcsFeedbackIssuesOrConcernsFactory.build()
    res = {
      locals: { content },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response
  })

  const caseRefId = 'ics-test-123'
  const firstName = 'Alex'

  describe('renderPage', () => {
    it('renders the issues-or-concerns template', () => {
      const presenter = new IssuesOrConcernsPresenter(caseRefId, firstName)
      presenter.renderPage(res)
      expect(res.render).toHaveBeenCalledWith('appointment/issuesOrConcerns', expect.objectContaining({}))
    })

    it('includes static and dynamic text from content', () => {
      const presenter = new IssuesOrConcernsPresenter(caseRefId, firstName)
      presenter.renderPage(res)
      const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: IssuesOrConcernsViewModel }

      expect(renderData.content.pageTitle).toEqual('Issues or concerns – ICS feedback – Community Support')
      expect(renderData.content.pageHeader).toEqual('Issues or concerns')
      expect(renderData.content.issuesOrConcerns.label.text).toEqual('What issues or concerns did you identify?')
      expect(renderData.content.issuesOrConcerns.hint.text).toEqual(
        'Give details of anything that concerned you about Alex, or any issues they raised that might impact their engagement in future sessions.',
      )
      expect(renderData.content.submitButton.text).toEqual('Continue')
      expect(renderData.content.backLink.href).toEqual('/ics-feedback/ics-test-123/session-feedback')
    })

    it('has empty textarea and errorMessages', () => {
      const presenter = new IssuesOrConcernsPresenter(caseRefId, firstName)
      presenter.renderPage(res)
      const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: IssuesOrConcernsViewModel }

      expect(renderData.content.issuesOrConcerns.value).toHaveLength(0)
      expect(renderData.content.issuesOrConcerns.errorMessage).toHaveLength(0)
    })

    it('has textarea populated with values', () => {
      const presenter = new IssuesOrConcernsPresenter(caseRefId, firstName, { identified: 'Test text' })
      presenter.renderPage(res)
      const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: IssuesOrConcernsViewModel }

      expect(renderData.content.issuesOrConcerns.value).toEqual('Test text')
    })

    it('has error messages rendering correctly', () => {
      const presenter = new IssuesOrConcernsPresenter(caseRefId, firstName, {}, { list: [{ text: 'issuesOrConcerns' }], messages: { issuesOrConcerns: 'Test error' } })
      presenter.renderPage(res)
      const renderData = (res.render as jest.Mock).mock.calls[0][1] as { content: IssuesOrConcernsViewModel }

      expect(renderData.content.issuesOrConcerns.errorMessage).toEqual('Test error')
    })
  })
})
