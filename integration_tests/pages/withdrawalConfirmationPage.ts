import { expect, Locator, Page } from '@playwright/test'
import AbstractPage from './abstractPage'
import ErrorSummary from './components/errorSummary'

export default class WithdrawalConfirmationPage extends AbstractPage {
  private constructor(
    page: Page,
    readonly header: Locator,
    readonly confirmationRadios: Locator,
    readonly errorSummary: ErrorSummary,
    readonly continueButton: Locator,
  ) {
    super(page)
  }

  static url(referralIdentifier: string): string {
    return `/referral/${referralIdentifier}/withdraw/confirmation`
  }

  static async verifyOnPage(page: Page): Promise<WithdrawalConfirmationPage> {
    const header = page.getByRole('heading', { level: 1 })
    await expect(header).toBeVisible()
    return new WithdrawalConfirmationPage(
      page,
      header,
      page.locator('input[name="confirmWithdrawal"]'),
      await ErrorSummary.create(page.locator('[data-testid="error-messages"]')),
      page.getByRole('button', { name: 'Continue', exact: true }),
    )
  }

  choice(label: string): Locator {
    return this.page.getByLabel(label, { exact: true })
  }
}
