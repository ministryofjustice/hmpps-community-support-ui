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

  private constructor(page: Page) {
    super(page)
    this.heading = page.getByText('Appointment type').first()
    this.backLink = page.getByRole('link', { name: 'Back', exact: true })
    this.continueButton = page.getByRole('button', { name: 'Continue', exact: true })
    this.errorSummary = page.locator('[data-testid="error-messages"]')
  }

  static async verifyOnPage(page: Page): Promise<AppointmentTypePage> {
    const appointmentTypePage = new AppointmentTypePage(page)
    await expect(appointmentTypePage.heading).toBeVisible()
    await expect(appointmentTypePage.continueButton).toBeVisible()
    return appointmentTypePage
  }

  radioOption(appointmentType: string): Locator {
    const valueMap: Record<string, string> = {
      ICS: 'ics',
      CONTACT_SESSION: 'contact',
      PRE_RELEASE_SESSION: 'pre-release',
      POST_RELEASE_SESSION: 'post-release',
      HANDOVER_SESSION: 'handover',
    }

    const normalisedValue = valueMap[appointmentType] ?? appointmentType
    return this.page.locator(`input[name="appointmentType"][value="${normalisedValue}"]`)
  }

  async selectAppointmentType(appointmentType: string): Promise<void> {
    await this.radioOption(appointmentType).check()
  }
}
