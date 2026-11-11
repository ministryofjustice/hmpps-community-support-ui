import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'
import ReferralNavigation from './components/referralNavigation'

export default class ReferralAppointmentsPage extends AbstractPage {
  readonly header: Locator

  readonly upcomingAppointmentsTable: Locator

  readonly pastAppointmentsTable: Locator

  readonly bookAppointmentButton: Locator

  readonly noAppointmentsMessage: Locator

  readonly noUpcomingAppointmentsMessage: Locator

  readonly noPastAppointmentsMessage: Locator

  readonly successAlert: Locator

  readonly navigation: ReferralNavigation

  static url(caseReference: string): string {
    return `/referral/${caseReference}/appointments`
  }

  constructor(page: Page) {
    super(page)
    this.navigation = new ReferralNavigation(page)
    this.header = page.locator('h1')
    this.upcomingAppointmentsTable = page.locator('[data-testid="referral-upcoming-appointments-table"]')
    this.pastAppointmentsTable = page.locator('[data-testid="referral-past-appointments-table"]')
    this.bookAppointmentButton = page.getByRole('button', { name: 'Book appointment', exact: true })
    this.noAppointmentsMessage = page.locator('[data-testid="no-appointments-message"]')
    this.noUpcomingAppointmentsMessage = page.locator('[data-testid="no-upcoming-appointments-message"]')
    this.noPastAppointmentsMessage = page.locator('[data-testid="no-past-appointments-message"]')
    this.successAlert = page.locator('.moj-alert--success')
  }

  async verifyOnPage(): Promise<void> {
    await expect(this.header).toBeVisible()
    await expect(this.bookAppointmentButton).toBeVisible()
    await expect(
      this.upcomingAppointmentsTable.or(this.noUpcomingAppointmentsMessage).or(this.noAppointmentsMessage),
    ).toBeVisible()
  }
}
