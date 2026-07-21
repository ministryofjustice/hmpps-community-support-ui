import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class HomePage extends AbstractPage {
  readonly header: Locator

  readonly makeAReferralTile: Locator

  readonly viewCasesTile: Locator

  readonly tileLinks: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.getByRole('heading', { level: 1, name: 'Community Support' })
    this.makeAReferralTile = page.getByRole('link', { name: 'Make a referral' })
    this.viewCasesTile = page.getByRole('link', { name: 'View cases' })
    this.tileLinks = page.locator('.card__link')
  }

  static async verifyOnPage(page: Page): Promise<HomePage> {
    const homePage = new HomePage(page)
    await expect(homePage.header).toBeVisible()
    return homePage
  }

  async expectTileOrder(expectedOrder: string[]): Promise<void> {
    await expect(this.tileLinks).toHaveText(expectedOrder)
  }

  async clickMakeAReferralTile(): Promise<void> {
    await this.makeAReferralTile.click()
  }

  async clickViewCasesTile(): Promise<void> {
    await this.viewCasesTile.click()
  }
}
