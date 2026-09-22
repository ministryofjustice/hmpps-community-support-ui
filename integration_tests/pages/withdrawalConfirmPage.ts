import { expect, Locator, Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class WithdrawalConfirmPage extends AbstractPage {
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

  static url(caseIdentifier: string): string {
    return `/referral/${caseIdentifier}/withdraw/confirm`
  }

  static async verifyOnPage(page: Page): Promise<WithdrawalConfirmPage> {
    const header = page.getByRole('heading', { level: 1 })
    await expect(header).toBeVisible()
    return new WithdrawalConfirmPage(
      page,
      header,
      page.locator('.govuk-summary-list__key'),
      page.locator('.govuk-summary-list__value'),
      page.getByText('If you are withdrawing this referral, you cannot start or change it again.'),
      page.getByRole('button', { name: 'Withdraw referral', exact: true }),
      page.getByRole('link', { name: 'Cancel', exact: true }),
      page.getByRole('link', { name: 'Change withdrawal reason', exact: true }),
    )
  }
}
