import type { Response } from 'express'
import nunjucks from 'nunjucks'
import SummaryListPagePresenter, { SummaryListPageContent } from './summaryListPagePresenter'

describe('SummaryListPagePresenter', () => {
  const options: SummaryListPageContent = {
    title: 'Example details',
    backLink: { href: '/previous-page' },
    summaryList: {
      rows: [{ key: { text: 'Name' }, value: { text: 'Alex Smith' } }],
    },
  }

  const createPresenter = (pageContent: unknown = options, pageRoute = 'referral.examplePage') => {
    const presenter = new SummaryListPagePresenter(pageRoute)
    jest
      .spyOn(presenter as unknown as { globalContent: () => unknown }, 'globalContent')
      .mockReturnValue({ referral: { examplePage: pageContent } })
    return presenter
  }

  it('builds the heading, browser title and GOV.UK component options', () => {
    const presenter = createPresenter()

    expect(presenter.buildViewModel()).toEqual({
      pageTitle: 'Example details',
      heading: 'Example details',
      backLink: options.backLink,
      summaryList: options.summaryList,
    })
  })

  it('preserves custom Back link options', () => {
    const backLink = {
      href: '/overview',
      text: 'Back to overview',
      classes: 'custom-back-link',
      attributes: { 'data-testid': 'back-link' },
    }

    expect(createPresenter({ ...options, backLink }).buildViewModel().backLink).toEqual(backLink)
  })

  it('preserves summary list cards, actions and formatting', () => {
    const summaryList: SummaryListPageContent['summaryList'] = {
      classes: 'govuk-summary-list--no-border',
      card: {
        title: { text: 'Details' },
        actions: { items: [{ href: '/change', text: 'Change', visuallyHiddenText: 'details' }] },
      },
      rows: [
        {
          key: { text: 'Name' },
          value: { html: '<strong>Alex Smith</strong>' },
          actions: { items: [{ href: '/change-name', text: 'Change', visuallyHiddenText: 'name' }] },
        },
      ],
    }

    expect(createPresenter({ ...options, summaryList }).buildViewModel().summaryList).toEqual(summaryList)
  })

  it('supports an empty summary list', () => {
    expect(createPresenter({ ...options, summaryList: { rows: [] } }).buildViewModel().summaryList).toEqual({
      rows: [],
    })
  })

  it.each(['', 'referral.missing', 'missing.examplePage', 'referral.examplePage.title.missing', 'referral.toString'])(
    'rejects a missing or invalid content route: %s',
    pageRoute => {
      expect(() => createPresenter(options, pageRoute).buildViewModel()).toThrow(
        `Invalid summary list page content at "${pageRoute}"`,
      )
    },
  )

  it.each([
    null,
    {},
    { ...options, title: undefined },
    { ...options, backLink: {} },
    { ...options, summaryList: {} },
    { ...options, summaryList: { rows: 'invalid' } },
  ])('rejects invalid page content: %p', pageContent => {
    const presenter = createPresenter(pageContent)

    expect(() => presenter.buildViewModel()).toThrow('expected title, backLink.href and summaryList.rows')
  })

  it('renders the shared template with the view model', () => {
    const presenter = createPresenter()
    const render = jest.fn()
    const response = { render } as unknown as Response

    presenter.renderPage(response)

    expect(render).toHaveBeenCalledTimes(1)
    expect(render).toHaveBeenCalledWith('shared/summaryListPage', { content: presenter.buildViewModel() })
  })

  describe('linked template', () => {
    const environment = new nunjucks.Environment(
      new nunjucks.FileSystemLoader([
        'server/views',
        'node_modules/govuk-frontend/dist/',
        'node_modules/@ministryofjustice/frontend/',
      ]),
      { autoescape: true },
    )
    environment.addFilter('assetMap', (url: string) => url)

    const renderPage = (pageContent: SummaryListPageContent) =>
      environment.render('shared/summaryListPage.njk', {
        applicationName: 'Community Support',
        content: createPresenter(pageContent).buildViewModel(),
      })

    it('renders one Back link, one heading, a browser title and the summary list', () => {
      const html = renderPage(options)

      expect(html.match(/class="govuk-back-link"/g)).toHaveLength(1)
      expect(html).toMatch(/href="\/previous-page"[^>]*>\s*Back\s*<\/a>/)
      expect(html.match(/<h1\b/g)).toHaveLength(1)
      expect(html).toContain('<h1 class="govuk-heading-l">Example details</h1>')
      expect(html).toContain('<title>Example details - Community Support</title>')
      expect(html).toContain('class="govuk-summary-list"')
      expect(html).toContain('Name')
      expect(html).toContain('Alex Smith')
    })

    it('renders a custom Back link label', () => {
      const html = renderPage({ ...options, backLink: { href: '/overview', text: 'Back to overview' } })

      expect(html).toMatch(/href="\/overview"[^>]*>\s*Back to overview\s*<\/a>/)
    })

    it('escapes the title and summary list text', () => {
      const html = renderPage({
        ...options,
        title: '<script>title</script>',
        summaryList: {
          rows: [{ key: { text: '<b>Name</b>' }, value: { text: '<script>value</script>' } }],
        },
      })

      expect(html).toContain('&lt;script&gt;title&lt;/script&gt;')
      expect(html).toContain('&lt;b&gt;Name&lt;/b&gt;')
      expect(html).toContain('&lt;script&gt;value&lt;/script&gt;')
      expect(html).not.toContain('<script>title</script>')
      expect(html).not.toContain('<script>value</script>')
    })
  })
})
