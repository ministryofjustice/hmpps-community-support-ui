import { expect, type Locator, type Page } from '@playwright/test'
import IcsSummaryPage from './icsSummaryPage'

export default class ConfirmIcsPage extends IcsSummaryPage {
  readonly header: Locator

  readonly changeLink: Locator

  readonly submitButton: Locator

  readonly notificationBanner: Locator

  static url(referralId: string): string {
    return `/referral/${referralId}/appointment/confirm-ics`
  }

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: 'Check the details before scheduling the ICS' })
    this.changeLink = page.locator('a', { hasText: 'Change' })
    this.submitButton = page.locator('button', { hasText: 'Submit' })
    this.notificationBanner = page.locator('.govuk-notification-banner')
  }

  static async verifyOnPage(page: Page): Promise<ConfirmIcsPage> {
    const confirmIcsPage = new ConfirmIcsPage(page)
    await expect(confirmIcsPage.header).toBeVisible()
    await expect(confirmIcsPage.icsDetailsSummary).toBeVisible()
    return confirmIcsPage
  }
}
