import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class WithdrawalServiceErrorPage extends AbstractPage {
  readonly header: Locator

  readonly message: Locator

  readonly goToCasesListButton: Locator

  static url(caseIdentifier: string): string {
    return `/referral/${caseIdentifier}/withdraw/service-error`
  }

  private constructor(page: Page) {
    super(page)
    this.header = page.getByRole('heading', { level: 1, name: 'Sorry, there is a problem with this service' })
    this.message = page.getByText('Try again later.', { exact: true })
    this.goToCasesListButton = page.getByRole('button', { name: 'Go to case list' })
  }

  static async verifyOnPage(page: Page): Promise<WithdrawalServiceErrorPage> {
    const withdrawalServiceErrorPage = new WithdrawalServiceErrorPage(page)
    await expect(withdrawalServiceErrorPage.header).toBeVisible()
    await expect(withdrawalServiceErrorPage.message).toBeVisible()
    await expect(withdrawalServiceErrorPage.goToCasesListButton).toBeVisible()
    return withdrawalServiceErrorPage
  }
}
