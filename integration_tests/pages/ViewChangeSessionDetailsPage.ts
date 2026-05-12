import { expect, type Locator, type Page } from '@playwright/test'
import IcsSummaryPage from './icsSummaryPage'

export default class ViewChangeSessionDetailsPage extends IcsSummaryPage {
  readonly header: Locator

  readonly backLink: Locator

  static url(referralId: string, icsId: string): string {
    return `/referral/${referralId}/ics/${icsId}/view-session-details`
  }

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: 'View session details' })
    this.backLink = page.getByRole('link', { name: 'Back', exact: true })
  }

  static async verifyOnPage(page: Page): Promise<ViewChangeSessionDetailsPage> {
    const viewChangePage = new ViewChangeSessionDetailsPage(page)
    await expect(viewChangePage.header).toBeVisible()
    await expect(viewChangePage.icsDetailsSummary).toBeVisible()
    return viewChangePage
  }
}
