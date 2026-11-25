import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class ReferralCheckYourAnswersPage extends AbstractPage {
  readonly header: Locator

  readonly subHeader: Locator

  readonly summaryList: Locator

  readonly backLink: Locator

  readonly submitButton: Locator

  static url(caseReference: string): string {
    return `/referral/${caseReference}/notes/check-your-answers`
  }

  constructor(page: Page) {
    super(page)
    this.header = page.getByRole('heading', { name: 'Check your answers', exact: true, level: 1 })
    this.subHeader = page.locator('h2.govuk-heading-m')
    this.summaryList = page.locator('.govuk-summary-list')
    this.backLink = page.getByRole('link', { name: 'Back', exact: true })
    this.submitButton = page.getByRole('button', { name: 'Submit', exact: true })
  }

  async verifyOnPage(): Promise<void> {
    await expect(this.header).toBeVisible()
    await expect(this.subHeader).toBeVisible()
    await expect(this.summaryList).toBeVisible()
    await expect(this.submitButton).toBeVisible()
  }

  summaryValue(label: string): Locator {
    return this.summaryList
      .locator('.govuk-summary-list__row', { hasText: label })
      .locator('.govuk-summary-list__value')
  }

  async submit(): Promise<void> {
    await this.submitButton.click()
  }
}
