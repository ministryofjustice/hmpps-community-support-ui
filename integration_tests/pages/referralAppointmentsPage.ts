import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class ReferralAppointmentsPage extends AbstractPage {
  readonly header: Locator

  readonly appointmentsTable: Locator

  readonly createAppointmentLink: Locator

  static url(caseReference: string): string {
    return `/referral/${caseReference}/appointments`
  }

  constructor(page: Page) {
    super(page)
    this.header = page.locator('h1')
    this.appointmentsTable = page.locator('[data-testid="referral-appointments-table"]')
    this.createAppointmentLink = page.getByRole('link', { name: 'Create an Appointment', exact: true })
  }

  async verifyOnPage(): Promise<void> {
    await expect(this.header).toBeVisible()
    await expect(this.appointmentsTable).toBeVisible()
  }
}
