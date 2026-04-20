import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'
import Radios from './components/radios'
import SummaryList from './components/summaryList'

export default class RecordSessionAttendancePage extends AbstractPage {
  private constructor(
    page: Page,
    readonly header: Locator,
    readonly subheading: Locator,
    readonly backLink: Locator,
    readonly summary: SummaryList,
    readonly radios: Radios,
    readonly submit: Locator,
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
    const radios = await Radios.create(page.locator('[data-testid="attended"]'))
    const submit = page.locator('')
    return new RecordSessionAttendancePage(page, header, subheading, backLink, summary, radios, submit)
  }
}
