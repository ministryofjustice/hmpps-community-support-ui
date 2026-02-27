import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class AssignPage extends AbstractPage {
  public readonly header: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1')
  }

  static async verifyOnPage(page: Page): Promise<AssignPage> {
    const assignPage = new AssignPage(page)
    return assignPage
  }
}
