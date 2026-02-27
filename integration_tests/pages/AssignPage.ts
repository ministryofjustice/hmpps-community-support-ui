import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class AssignPage extends AbstractPage {
  public readonly header: Locator

  public readonly subheader: Locator

  public emailAddressInputs: Locator[]

  public readonly addAnotherCaseWorkerButton: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1')
    this.subheader = page.locator('legend')
    this.addAnotherCaseWorkerButton = page.locator('[data-testid="addAnotherCaseWorker"]')
    this.emailAddressInputs = []
  }

  async updateInputs() {
    const inputs = this.page.locator('[data-testid="caseWorkerInput"]')
    this.emailAddressInputs = await inputs.count().then(count =>
      Array(count)
        .fill(0)
        .map((_, i) => inputs.nth(i)),
    )
  }

  static async verifyOnPage(page: Page): Promise<AssignPage> {
    const assignPage = new AssignPage(page)
    await expect(assignPage.header).toBeVisible()
    await assignPage.updateInputs()
    return assignPage
  }
}
