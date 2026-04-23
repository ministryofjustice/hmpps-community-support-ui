import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'
import RadiosWithFieldSet from './components/radiosWithFieldSet'
import SummaryList from './components/summaryList'
import ErrorSummary from './components/errorSummary'

export default class RecordSessionAttendancePage extends AbstractPage {
  private constructor(
    page: Page,
    readonly errorSummary: ErrorSummary,
    readonly header: Locator,
    readonly subheading: Locator,
    readonly backLink: Locator,
    readonly summary: SummaryList,
    readonly sessionHappenedRadios: RadiosWithFieldSet,
    readonly sessionAttendedRadios: RadiosWithFieldSet,
    readonly continueButton: Locator,
  ) {
    super(page)
  }

  static url(caseRefId: string): string {
    return `/ics-feedback/${caseRefId}/attendance`
  }

  static async verifyOnPage(page: Page): Promise<RecordSessionAttendancePage> {
    const header = page.locator('h1')
    await expect(header).toBeVisible()
    const errorSummary = await ErrorSummary.create(page.locator('[data-testid="error-messages"]'))
    const subheading = page.locator('[data-testid="subheading"]')
    const backLink = page.getByRole('link', { name: 'Back', exact: true })
    const summary = await SummaryList.create(page.locator('[data-testid="appointment-details"]'))
    const happened = await RadiosWithFieldSet.create(
      page.locator('[data-testid="happened"]'),
      page.locator('[data-testid="fieldset-happened"]'),
    )
    const attended = await RadiosWithFieldSet.create(
      page.locator('[data-testid="attended"]'),
      page.locator('[data-testid="fieldset-attended"]'),
    )
    const submit = page.getByRole('button', { name: 'Continue' })
    return new RecordSessionAttendancePage(
      page,
      errorSummary,
      header,
      subheading,
      backLink,
      summary,
      happened,
      attended,
      submit,
    )
  }
}
