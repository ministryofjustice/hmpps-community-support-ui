import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'
import RadiosWithFieldSet from './components/radiosWithFieldSet'
import SummaryList from './components/summaryList'

export default class RecordSessionAttendancePage extends AbstractPage {
  private constructor(
    page: Page,
    readonly header: Locator,
    readonly subheading: Locator,
    readonly backLink: Locator,
    readonly summary: SummaryList,
    readonly attendedRadios: RadiosWithFieldSet,
    readonly sessionHappenedRadios: RadiosWithFieldSet,
    readonly submitButton: Locator,
  ) {
    super(page)
  }

  static url(caseRefId: string): string {
    return `/ics-feedback/attendance/${caseRefId}`
  }

  static async verifyOnPage(page: Page): Promise<RecordSessionAttendancePage> {
    const header = page.locator('h1')
    await expect(header).toBeVisible()
    const subheading = page.locator('[data-testid="subheading"]')
    const backLink = page.getByRole('link', { name: 'Back', exact: true })
    const summary = await SummaryList.create(page.locator('[data-testid="appointment-details"]'))
    const attended = await RadiosWithFieldSet.create(
      page.locator('[data-testid="attended"]'),
      page.locator('[data-testid="fieldset-attended"]'),
    )
    const happened = await RadiosWithFieldSet.create(
      page.locator('[data-testid="happened"]'),
      page.locator('[data-testid="fieldset-happened"]'),
    )
    const submit = page.getByRole('button', { name: 'Continue' })
    return new RecordSessionAttendancePage(page, header, subheading, backLink, summary, attended, happened, submit)
  }
}
