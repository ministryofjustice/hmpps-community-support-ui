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

  readonly historyLink: Locator

  readonly actionPlanTitle: Locator

  readonly actionPlanTable: Locator

  readonly actionPlanLink: Locator

  static url(caseReference: string): string {
    return `/progress/${caseReference}`
  }

  private constructor(
    page: Page,
    public readonly icsTable: Table,
    public readonly historyTable: Table,
  ) {
    super(page)
    this.notificationBanner = page.locator('.govuk-notification-banner')
    this.header = page.locator('h1')
    this.subNavBar = page.locator('.moj-sub-navigation__list')
    this.subHeader = page.locator('h2')
    this.icsTitle = page.locator('h3')
    this.backLink = page.getByRole('link', { name: 'Back', exact: true })
    this.scheduleSessionLink = page.getByRole('link', { name: 'Schedule session', exact: true })
    this.viewOrChangeDetailsLink = page.getByRole('link', { name: 'View details', exact: true })
    this.addAttendanceAndFeedbackLink = page.getByRole('link', { name: 'Add attendance and feedback', exact: true })
    this.historyLink = page.locator('[data-testid="view-history-link"] .govuk-details__summary-text')
    this.actionPlanTitle = page.getByRole('heading', { name: 'Action plan', level: 3 })
    this.actionPlanTable = page.locator('[data-testid="action-plan-table"]')
    this.actionPlanLink = page.getByRole('link', { name: 'View action plan', exact: true })
  }

  static async verifyOnPage(page: Page): Promise<ReferralProgressPage> {
    const icsTable = await Table.create(page.locator('[data-testid="referral-progress-table"]'))
    const historyTable = await Table.create(page.locator('[data-testid="referral-history-table"]'))
    const referralProgressPage = new ReferralProgressPage(page, icsTable, historyTable)
    await expect(referralProgressPage.header).toBeVisible()
    return referralProgressPage
  }

  static async verifySuccessBanner(page: Page, heading: string, message: string): Promise<ReferralProgressPage> {
    const icsTable = await Table.create(page.locator('[data-testid="referral-progress-table"]'))
    const historyTable = await Table.create(page.locator('[data-testid="referral-history-table"]'))
    const referralProgressPage = new ReferralProgressPage(page, icsTable, historyTable)
    const banner = referralProgressPage.notificationBanner
    await expect(banner).toHaveClass(/govuk-notification-banner--success/)
    await expect(banner.locator('.govuk-notification-banner__title')).toHaveText('Success')
    await expect(banner.locator('.govuk-notification-banner__heading')).toHaveText(heading)
    await expect(banner.locator('.govuk-body')).toContainText(message)
    return referralProgressPage
  }

  static async verifyNoBanner(page: Page): Promise<ReferralProgressPage> {
    const icsTable = await Table.create(page.locator('[data-testid="referral-progress-table"]'))
    const historyTable = await Table.create(page.locator('[data-testid="referral-history-table"]'))
    const referralProgressPage = new ReferralProgressPage(page, icsTable, historyTable)
    await expect(referralProgressPage.notificationBanner).not.toBeVisible()
    return referralProgressPage
  }
}
