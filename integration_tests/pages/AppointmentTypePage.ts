import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class AppointmentTypePage extends AbstractPage {
  readonly heading: Locator

  readonly backLink: Locator

  readonly continueButton: Locator

  readonly errorSummary: Locator

  static url(caseReference: string): string {
    return `/referral/${caseReference}/create-an-appointment/appointment-type`
  }

  static detailsUrl(caseReference: string): string {
    return `/referral/${caseReference}/create-an-appointment/appointment-details`
  }

  private constructor(page: Page) {
    super(page)
    this.heading = page.getByRole('heading', { level: 1 })
    this.backLink = page.getByRole('link', { name: 'Back', exact: true })
    this.continueButton = page.getByRole('button', { name: 'Save and continue' })
    this.errorSummary = page.locator('[data-testid="error-messages"]')
  }

  static async verifyOnPage(page: Page): Promise<AppointmentTypePage> {
    const appointmentTypePage = new AppointmentTypePage(page)
    await expect(appointmentTypePage.heading).toBeVisible()
    await expect(appointmentTypePage.continueButton).toBeVisible()
    return appointmentTypePage
  }

  radioOption(appointmentType: string): Locator {
    return this.page.locator(`input[name="appointmentType"][value="${appointmentType}"]`)
  }

  async selectAppointmentType(appointmentType: string): Promise<void> {
    await this.radioOption(appointmentType).check()
  }
}
