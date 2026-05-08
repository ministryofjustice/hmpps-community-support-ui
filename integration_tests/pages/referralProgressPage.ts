import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'
import Table from './components/table'

export default class ReferralProgressPage extends AbstractPage {
  readonly header: Locator

  readonly notificationBanner: Locator

  readonly subNavBar: Locator

  readonly subHeader: Locator

  readonly icsTitle: Locator

  readonly backLink: Locator

  readonly scheduleSessionLink: Locator

  readonly viewOrChangeDetailsLink: Locator

  readonly addAttendanceAndFeedbackLink: Locator

  static url(caseReference: string): string {
    return `/progress/${caseReference}`
  }

  private constructor(
    page: Page,
    public readonly table: Table,
  ) {
    super(page)
    this.notificationBanner = page.locator('.govuk-notification-banner')
    this.header = page.locator('h1')
    this.subNavBar = page.locator('.moj-sub-navigation__list')
    this.subHeader = page.locator('h2')
    this.icsTitle = page.locator('h3')
    this.backLink = page.getByRole('link', { name: 'Back', exact: true })
    this.scheduleSessionLink = page.getByRole('link', { name: 'Schedule session', exact: true })
    this.viewOrChangeDetailsLink = page.getByRole('link', { name: 'View or change details', exact: true })
    this.addAttendanceAndFeedbackLink = page.getByRole('link', { name: 'Add attendance and feedback', exact: true })
  }

  static async verifyOnPage(page: Page): Promise<ReferralProgressPage> {
    const icsTable = await Table.create(page.locator('[data-testid="referral-progress-table"]'))
    const referralProgressPage = new ReferralProgressPage(page, icsTable)
    await expect(referralProgressPage.header).toBeVisible()
    return referralProgressPage
  }
}
