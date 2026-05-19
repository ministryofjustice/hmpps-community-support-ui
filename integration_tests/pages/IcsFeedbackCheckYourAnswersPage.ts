import { Locator, Page, expect } from '@playwright/test'
import AbstractPage from './abstractPage'

class IcsFeedbackCheckYourAnswersPage extends AbstractPage {
  readonly header: Locator

  readonly attendanceSummary: Locator

  readonly sessionDetailsSummary: Locator

  readonly sessionFeedbackSummary: Locator

  readonly locationRowTitle: Locator

  readonly submitButton: Locator

  static url(caseRefId: string) {
    return `/ics-feedback/${caseRefId}/check-your-answers`
  }

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: 'Check your answers before submitting feedback' })
    this.attendanceSummary = page.locator('h2', { hasText: 'Record session attendance' })
    this.sessionDetailsSummary = page.locator('h2', { hasText: 'Session details' })
    this.sessionFeedbackSummary = page.locator('h2', { hasText: 'Session feedback' })
    this.submitButton = page.locator('button', { hasText: 'Submit feedback' })
    this.locationRowTitle = page.locator('dt', { hasText: 'Location' })
  }

  static async verifyOnPage(page: Page): Promise<IcsFeedbackCheckYourAnswersPage> {
    const icsFeedbackCheckYourAnswersPage = new IcsFeedbackCheckYourAnswersPage(page)
    await expect(icsFeedbackCheckYourAnswersPage.header).toBeVisible()
    return icsFeedbackCheckYourAnswersPage
  }
}

export default IcsFeedbackCheckYourAnswersPage
