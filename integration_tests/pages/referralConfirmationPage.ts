import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class ReferralConfirmationPage extends AbstractPage {
  readonly header: Locator

  readonly panelMessage: Locator

  readonly referenceNumber: Locator

  readonly startNewReferralButton: Locator

  readonly backToCommunityHomeLink: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: 'The referral has been sent' })
    this.panelMessage = page.locator('text=Your reference number')
    this.referenceNumber = page.locator('strong', { hasText: 'QD0878DE' })
    this.startNewReferralButton = page.getByRole('button', { name: 'Start a new referral' })
    this.backToCommunityHomeLink = page.locator('a', { hasText: 'Back to Community Support Homepage' })
  }

  static async verifyOnPage(page: Page): Promise<ReferralConfirmationPage> {
    const referralConfirmationPage = new ReferralConfirmationPage(page)
    await expect(referralConfirmationPage.header).toBeVisible()
    await expect(referralConfirmationPage.panelMessage).toBeVisible()
    await expect(referralConfirmationPage.referenceNumber).toBeVisible()
    await expect(referralConfirmationPage.startNewReferralButton).toBeVisible()
    await expect(referralConfirmationPage.startNewReferralButton).toHaveAttribute('href', '/referral/new/find-a-person')
    await expect(referralConfirmationPage.backToCommunityHomeLink).toBeVisible()
    await expect(referralConfirmationPage.backToCommunityHomeLink).toHaveAttribute('href', '/')
    return referralConfirmationPage
  }
}
