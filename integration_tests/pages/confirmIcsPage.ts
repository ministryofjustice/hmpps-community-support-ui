import { expect, type Locator, type Page } from '@playwright/test'
import IcsSummaryPage from './icsSummaryPage'

export default class ConfirmIcsPage extends IcsSummaryPage {
  readonly header: Locator

  readonly changeLinks: Locator

  readonly submitButton: Locator

  readonly notificationBanner: Locator

  readonly changeDetailsSummary: Locator

  readonly requestedByRow: Locator

  readonly reasonForChangeRow: Locator

  static url(referralId: string): string {
    return `/referral/${referralId}/appointment/confirm-ics`
  }

  static rescheduleUrl(referralId: string): string {
    return `/referral/${referralId}/ics-change-details/check-answers`
  }

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: 'Check the details before scheduling the ICS' })
    this.changeLinks = page.locator('a', { hasText: 'Change' })
    this.submitButton = page.locator('button', { hasText: 'Submit' })
    this.notificationBanner = page.locator('.govuk-notification-banner')
    this.changeDetailsSummary = page.locator('.govuk-summary-card', { hasText: 'Reason for change' })
    this.requestedByRow = page.locator('.govuk-summary-list__row', { hasText: 'Who requested the change' })
    this.reasonForChangeRow = page.locator('.govuk-summary-list__row', { hasText: 'Reason for the change' })
  }

  static async verifyOnPage(page: Page): Promise<ConfirmIcsPage> {
    const confirmIcsPage = new ConfirmIcsPage(page)
    await expect(confirmIcsPage.header).toBeVisible()
    await expect(confirmIcsPage.icsDetailsSummary).toBeVisible()
    return confirmIcsPage
  }
}
