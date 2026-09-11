import { expect, Locator, Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class WithdrawalConfirmationPage extends AbstractPage {
  private constructor(
    page: Page,
    readonly header: Locator,
    readonly reasonSummaryKey: Locator,
    readonly reasonSummaryValue: Locator,
    readonly warningText: Locator,
    readonly withdrawButton: Locator,
    readonly cancelLink: Locator,
    readonly changeLink: Locator,
  ) {
    super(page)
  }

  static url(referralIdentifier: string): string {
    return `/referral/${referralIdentifier}/withdraw/confirm`
  }

  static async verifyOnPage(page: Page): Promise<WithdrawalConfirmationPage> {
    const header = page.getByRole('heading', { level: 1 })
    await expect(header).toBeVisible()
    return new WithdrawalConfirmationPage(
      page,
      header,
      page.locator('.govuk-summary-list__key'),
      page.locator('.govuk-summary-list__value'),
      page.getByText('If you are withdrawing this referral, you cannot start or change it again.'),
      page.getByRole('button', { name: 'Withdraw referral', exact: true }),
      page.getByRole('link', { name: 'Cancel', exact: true }),
      page.getByRole('link', { name: 'Change', exact: true }),
    )
  }
}
