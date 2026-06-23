import { expect, Locator, Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class ViewIcsSessionFeedbackPage extends AbstractPage {
  readonly header: Locator

  readonly backLink: Locator

  readonly appointmentDetailsSummary: Locator

  readonly sessionDetailsSummary: Locator

  readonly recordSessionAttendanceSummary: Locator

  readonly sessionFeedbackSummary: Locator

  static url(caseRefId: string, rowIndex: string): string {
    return `/ics-feedback/${caseRefId}/session/${rowIndex}`
  }

  private constructor(page: Page) {
    super(page)

    this.header = page.locator('h1', { hasText: 'View session feedback' })
    this.backLink = page.getByRole('link', { name: 'Back', exact: true })
    this.appointmentDetailsSummary = page.getByRole('heading', { name: 'Appointment details' })
    this.sessionDetailsSummary = page.locator('.govuk-summary-card', {
      has: page.getByRole('heading', { name: 'Session details' }),
    })
    this.recordSessionAttendanceSummary = page.getByRole('heading', { name: 'Record session attendance' })
    this.sessionFeedbackSummary = page.getByRole('heading', { name: 'Session feedback' })
  }

  static async verifyOnPage(page: Page): Promise<ViewIcsSessionFeedbackPage> {
    const pageObject = new ViewIcsSessionFeedbackPage(page)

    await expect(pageObject.header).toBeVisible()
    await expect(pageObject.backLink).toBeVisible()

    return pageObject
  }
}
