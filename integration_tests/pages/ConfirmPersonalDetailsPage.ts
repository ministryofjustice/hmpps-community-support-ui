import { Page, Locator, expect } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class ConfirmPersonalDetailsPage extends AbstractPage {
  private constructor(
    page: Page,
    readonly header: Locator,
    readonly button: Locator,
  ) {
    super(page)
  }

  static async verifyOnPage(page: Page): Promise<ConfirmPersonalDetailsPage> {
    const header = page.getByRole('heading', { name: 'Confirm personal details' })
    const button = page.getByRole('button', { name: 'Continue' })
    await expect(header).toBeVisible()
    return new ConfirmPersonalDetailsPage(page, header, button)
  }

  async clickContinue() {
    await this.button.click()
  }
}
