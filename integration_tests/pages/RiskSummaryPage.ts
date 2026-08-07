import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class RiskSummaryPage extends AbstractPage {
  readonly heading: Locator

  readonly subHeading: Locator

  readonly crn: Locator

  readonly dateOfBirth: Locator

  readonly lastUpdated: Locator

  readonly saveAndContinueButton: Locator

  readonly backLink: Locator

  private constructor(page: Page) {
    super(page)
    this.heading = page.getByTestId('heading')
    this.subHeading = page.locator('h2', { hasText: 'OASys risk information' })
    this.crn = page.getByTestId('crn')
    this.dateOfBirth = page.getByTestId('date-of-birth')
    this.lastUpdated = page.getByTestId('last-updated')
    this.saveAndContinueButton = page.getByRole('button', { name: 'Save and continue' })
    this.backLink = page.getByRole('link', { name: 'Back', exact: true })
  }

  static url(): string {
    return `/referral/task-list/view-risk-summary`
  }

  rowByHeading(heading: string): Locator {
    return this.page.getByTestId('risk-row').filter({ has: this.page.getByRole('heading', { name: heading }) })
  }

  rowIndicator(heading: string): Locator {
    return this.rowByHeading(heading).getByTestId('risk-indicator')
  }

  rowContent(heading: string): Locator {
    return this.rowByHeading(heading).getByTestId('risk-content')
  }

  static async verifyOnPage(page: Page): Promise<RiskSummaryPage> {
    const riskSummaryPage = new RiskSummaryPage(page)
    await expect(riskSummaryPage.heading).toBeVisible()
    await expect(riskSummaryPage.subHeading).toBeVisible()
    return riskSummaryPage
  }
}
