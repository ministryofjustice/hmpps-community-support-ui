import nunjucks from 'nunjucks'

describe('shared layout page title', () => {
  const environment = new nunjucks.Environment(
    new nunjucks.FileSystemLoader([
      'server/views',
      'node_modules/govuk-frontend/dist/',
      'node_modules/@ministryofjustice/frontend/',
    ]),
    { autoescape: true },
  )

  environment.addFilter('assetMap', (url: string) => url)

  const applicationName = 'Community Support'

  it('adds the application name to a page content title', () => {
    const html = environment.render('referral/service-days.njk', {
      applicationName,
      content: { pageTitle: 'Service days & dates', input: {}, button: {} },
      errors: { list: [] },
    })

    expect(html).toContain('<title>Service days &amp; dates - Community Support</title>')
  })

  it('preserves a page-specific title instead of using the content title', () => {
    const html = environment.render('pages/index.njk', {
      applicationName,
      content: { pageTitle: 'Another title', tiles: [] },
    })

    expect(html).toContain('<title>Community Support - Referral</title>')
  })

  it('preserves an explicitly supplied page title', () => {
    const html = environment.render('autherror.njk', {
      applicationName,
      pageTitle: 'Custom title',
      content: { pageTitle: 'Another title' },
    })

    expect(html).toContain('<title>Custom title</title>')
  })

  it('does not append the application name to an explicitly set content title', () => {
    const html = environment.render('referral/confirmAnAreaForReferral.njk', {
      applicationName,
      content: { pageTitle: 'Already complete - Community Support', card: {}, pdus: [] },
      errors: { list: [] },
    })

    expect(html).toContain('<title>Already complete - Community Support</title>')
  })

  it.each([undefined, {}])('falls back to the application name when content is %p', content => {
    const html = environment.render('autherror.njk', { applicationName, content })

    expect(html).toContain('<title>Community Support</title>')
  })
})
