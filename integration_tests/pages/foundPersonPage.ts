import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class FoundPersonPage extends AbstractPage {
  readonly header: Locator

  readonly personDetails: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: 'Confirm this is the correct person for referral' })
    this.personDetails = page.locator('[data-testid="personsummary"]')
  }

  static async verifyOnPage(page: Page): Promise<FoundPersonPage> {
    const foundPersonPage = new FoundPersonPage(page)
    await expect(foundPersonPage.header).toBeVisible()
    await expect(foundPersonPage.personDetails).toBeVisible()
    return foundPersonPage
  }
}
