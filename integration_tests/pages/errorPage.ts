import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'
import type { SystemError } from '../../server/interfaces/systemError'

export default class ErrorPage extends AbstractPage {
  readonly heading?: Locator

  readonly message: Locator

  readonly button?: Locator

  readonly stack?: Locator

  private constructor(page: Page, systemError?: SystemError) {
    super(page)
    if (systemError) {
      this.heading = page.locator('h1', { hasText: systemError.heading })
      this.message = page.getByText(systemError.message, { exact: true })
      this.button = page.getByRole('button', { name: systemError.buttonText })
    } else {
      this.message = page.locator('h1')
      this.stack = page.locator('pre')
    }
  }

  static async verifyOnSPage(page: Page): Promise<ErrorPage> {
    const errorPage = new ErrorPage(page)
    await expect(errorPage.message).toBeVisible()
    await expect(errorPage.stack!).toBeVisible()
    return errorPage
  }

  static async verifyOnSystemErrorPage(page: Page, systemError: SystemError): Promise<ErrorPage> {
    const errorPage = new ErrorPage(page, systemError)
    await expect(errorPage.heading!).toBeVisible()
    await expect(errorPage.message).toBeVisible()
    await expect(errorPage.button!).toBeVisible()
    return errorPage
  }

  async clickButton(): Promise<void> {
    await this.button?.click()
  }
}
