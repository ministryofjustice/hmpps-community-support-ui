import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class ConfirmIcsPage extends AbstractPage {
  readonly header: Locator

  readonly icsDetailsSummary: Locator

  readonly dateRow: Locator

  readonly startTimeRow: Locator

  readonly methodRow: Locator

  readonly notInPersonReasonRow: Locator

  readonly locationRow: Locator

  readonly sessionCommunicationRow: Locator

  readonly changeLink: Locator

  readonly submitButton: Locator

  readonly notificationBanner: Locator

  static url(referralId: string): string {
    return `/referral/${referralId}/appointment/confirm-ics`
  }

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: 'Check the details before scheduling the ICS' })
    this.icsDetailsSummary = page.locator('.govuk-summary-card')
    this.dateRow = page.locator('.govuk-summary-list__row', { hasText: 'Date' })
    this.startTimeRow = page.locator('.govuk-summary-list__row', { hasText: 'Start time' })
    this.methodRow = page.locator('.govuk-summary-list__row', { hasText: 'Method' })
    this.notInPersonReasonRow = page.locator('.govuk-summary-list__row', { hasText: 'Reason session is not in-person' })
    this.locationRow = page
      .locator('.govuk-summary-list__row')
      .filter({ has: page.locator('.govuk-summary-list__key', { hasText: 'Location' }) })
    this.sessionCommunicationRow = page.locator('.govuk-summary-list__row', {
      hasText: 'How the person was informed about the session',
    })
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
