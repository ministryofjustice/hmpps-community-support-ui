import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'
import SummaryList from './components/summaryList'

export default class InitialContactSessionDetailsPage extends AbstractPage {
  private constructor(
    page: Page,
    readonly header: Locator,
    readonly backLink: Locator,
    readonly details: SummaryList,
    readonly changeLink: Locator,
  ) {
    super(page)
  }

  static url(caseRefId: string): string {
    return `/referral-details/${caseRefId}/check-change-ics`
  }

  static async verifyOnPage(page: Page): Promise<InitialContactSessionDetailsPage> {
    const header = page.locator('h1')
    await expect(header).toBeVisible()
    const backLink = page.getByRole('link', { name: 'Back', exact: true })
    const details = await SummaryList.create(page.locator('[data-testid="details"]'))
    const changeLink = page.getByRole('link', { name: 'Change   (ICS details)' })
    return new InitialContactSessionDetailsPage(page, header, backLink, details, changeLink)
  }
}
