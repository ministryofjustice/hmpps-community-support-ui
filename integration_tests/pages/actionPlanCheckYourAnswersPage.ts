import { expect, Locator, Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class ActionPlanCheckYourAnswersPage extends AbstractPage {
  readonly header: Locator

  readonly backLink: Locator

  readonly submitButton: Locator

  static url(caseReference: string): string {
    return `/referral/${caseReference}/action-plan/service-delivery-check-your-answers`
  }

  private constructor(page: Page) {
    super(page)
    this.header = page.getByRole('heading', { level: 1 })
    this.backLink = page.getByRole('link', { name: 'Back', exact: true })
    this.submitButton = page.getByRole('button', { name: 'Submit action plan' })
  }

  summaryCard(title: string): Locator {
    return this.page.locator('.govuk-summary-card').filter({
      has: this.page.locator('.govuk-summary-card__title', { hasText: title }),
    })
  }

  summaryRow(label: string): Locator {
    return this.page.locator('.govuk-summary-list__row').filter({ has: this.page.getByText(label, { exact: true }) })
  }

  static async verifyOnPage(page: Page): Promise<ActionPlanCheckYourAnswersPage> {
    const checkYourAnswersPage = new ActionPlanCheckYourAnswersPage(page)
    await expect(checkYourAnswersPage.header).toBeVisible()
    return checkYourAnswersPage
  }
}
