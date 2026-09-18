import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class WithdrawalSuccessPage extends AbstractPage {
  readonly header: Locator

  readonly goToCasesListButton: Locator

  static url(referralIdentifier: string): string {
    return `/referral/${referralIdentifier}/withdraw/success`
  }

  private constructor(page: Page) {
    super(page)
    this.header = page.getByRole('heading', { level: 1, name: 'The referral has been withdrawn' })
    this.goToCasesListButton = page.getByRole('button', { name: 'Go to case list' })
  }

  static async verifyOnPage(page: Page): Promise<WithdrawalSuccessPage> {
    const withdrawalSuccessPage = new WithdrawalSuccessPage(page)
    await expect(withdrawalSuccessPage.header).toBeVisible()
    await expect(withdrawalSuccessPage.goToCasesListButton).toBeVisible()
    return withdrawalSuccessPage
  }
}
