import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class RiskSummaryErrorPage extends AbstractPage {
  readonly heading: Locator

  private constructor(page: Page) {
    super(page)
    this.heading = page.locator('h1')
  }

  static async verifyOnPage(page: Page): Promise<RiskSummaryErrorPage> {
    const errorPage = new RiskSummaryErrorPage(page)
    await expect(errorPage.heading).toBeVisible()
    return errorPage
  }
}
