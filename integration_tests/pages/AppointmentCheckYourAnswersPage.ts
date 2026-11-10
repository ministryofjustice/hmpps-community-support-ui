import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class AppointmentCheckYourAnswersPage extends AbstractPage {
  readonly heading: Locator

  readonly summaryCard: Locator

  readonly dateRow: Locator

  readonly startTimeRow: Locator

  readonly methodRow: Locator

  readonly probationOfficeRow: Locator

  readonly prisonRow: Locator

  readonly appointmentAddressRow: Locator

  readonly reasonSessionNotInPersonRow: Locator

  readonly informedByRow: Locator

  readonly changeLink: Locator

  readonly submitButton: Locator

  static url(caseReference: string): string {
    return `/referral/${caseReference}/create-an-appointment/check-your-answers`
  }

  private constructor(page: Page) {
    super(page)
    this.heading = page.getByRole('heading', { level: 1, name: /Check the details before booking the .+/i })
    this.summaryCard = page.locator('.govuk-summary-card')
    this.dateRow = page.locator('.govuk-summary-list__row').filter({ has: page.getByText('Date', { exact: true }) })
    this.startTimeRow = page
      .locator('.govuk-summary-list__row')
      .filter({ has: page.getByText('Start time', { exact: true }) })
    this.methodRow = page
      .locator('.govuk-summary-list__row')
      .filter({ has: page.getByText('How the session will take place', { exact: true }) })
    this.probationOfficeRow = page
      .locator('.govuk-summary-list__row')
      .filter({ has: page.getByText('Probation office', { exact: true }) })
    this.prisonRow = page.locator('.govuk-summary-list__row').filter({ has: page.getByText('Prison', { exact: true }) })
    this.appointmentAddressRow = page
      .locator('.govuk-summary-list__row')
      .filter({ has: page.getByText('Appointment address', { exact: true }) })
    this.reasonSessionNotInPersonRow = page
      .locator('.govuk-summary-list__row')
      .filter({ has: page.getByText('Reason session is not in person', { exact: true }) })
    this.informedByRow = page.locator('.govuk-summary-list__row', { hasText: 'was informed about the session' })
    this.changeLink = page.getByRole('link', { name: /change/i })
    this.submitButton = page.getByRole('button', { name: 'Submit' })
  }

  static async verifyOnPage(page: Page): Promise<AppointmentCheckYourAnswersPage> {
    const checkYourAnswersPage = new AppointmentCheckYourAnswersPage(page)
    await expect(checkYourAnswersPage.heading).toBeVisible()
    await expect(checkYourAnswersPage.summaryCard).toBeVisible()
    return checkYourAnswersPage
  }
}
