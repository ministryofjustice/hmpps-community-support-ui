import { type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

/**
 * Shared base class for pages that display an ICS details summary card.
 * Both the Confirm ICS page and the View/Change Session Details page
 * render the same govuk summary list structure, so locators are shared here.
 */
export default abstract class IcsSummaryPage extends AbstractPage {
  readonly icsDetailsSummary: Locator

  readonly dateRow: Locator

  readonly startTimeRow: Locator

  readonly methodRow: Locator

  readonly notInPersonReasonRow: Locator

  readonly locationRow: Locator

  readonly sessionCommunicationLabel: Locator

  readonly sessionCommunicationRow: Locator

  protected constructor(page: Page) {
    super(page)
    this.icsDetailsSummary = page.locator('.govuk-summary-card')
    this.dateRow = page.locator('.govuk-summary-list__row', { hasText: 'Date' })
    this.startTimeRow = page.locator('.govuk-summary-list__row', { hasText: 'Start time' })
    this.methodRow = page.locator('.govuk-summary-list__row', { hasText: 'Method' })
    this.notInPersonReasonRow = page.locator('.govuk-summary-list__row', {
      hasText: 'Reason session is not in-person',
    })
    this.locationRow = page
      .locator('.govuk-summary-list__row')
      .filter({ has: page.locator('.govuk-summary-list__key', { hasText: 'Location' }) })
    this.sessionCommunicationLabel = page.locator('.govuk-summary-list__key', {
      hasText: 'was informed about the session',
    })
    this.sessionCommunicationRow = page.locator('.govuk-summary-list__row', {
      hasText: 'was informed about the session',
    })
  }
}
