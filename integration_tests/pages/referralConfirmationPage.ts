import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class ReferralConfirmationPage extends AbstractPage {
  readonly header: Locator

  readonly panelMessage: Locator

  readonly referenceNumber: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: 'The referral has been sent' })
    this.panelMessage = page.locator('text=Your reference number')
    this.referenceNumber = page.locator('strong', { hasText: 'QD0878DE' })
  }

  static async verifyOnPage(page: Page): Promise<ReferralConfirmationPage> {
    const referralConfirmationPage = new ReferralConfirmationPage(page)
    await expect(referralConfirmationPage.header).toBeVisible()
    await expect(referralConfirmationPage.panelMessage).toBeVisible()
    await expect(referralConfirmationPage.referenceNumber).toBeVisible()
    return referralConfirmationPage
  }
}
