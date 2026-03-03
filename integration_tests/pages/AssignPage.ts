import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class AssignPage extends AbstractPage {
  public readonly header: Locator

  public readonly errorHeader: Locator

  public readonly subheader: Locator

  public emailAddressInputs: Locator[]

  public removeCaseWorkerButtons: Locator[]

  public readonly addAnotherCaseWorkerButton: Locator

  public readonly submitButton: Locator

  public readonly invalidEmailMessage: Locator

  public readonly blankEmailMessage: Locator

  public readonly unrecognisedEmailMessage: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1')
    this.errorHeader = page.locator('h2', { hasText: 'There is a problem' })
    this.subheader = page.locator('legend')
    this.addAnotherCaseWorkerButton = page.locator('[data-testid="addAnotherCaseWorker"]')
    this.removeCaseWorkerButtons = []
    this.emailAddressInputs = []
    this.submitButton = page.getByRole('button', { name: 'Submit' })
    this.invalidEmailMessage = page.locator(
      'a:has-text("Enter an email address in the correct format")[href*="#caseworkers"]',
    )
    this.blankEmailMessage = page.locator(`a:has-text("Enter the caseworker's email address")[href*="#caseworkers"]`)
    this.unrecognisedEmailMessage = page.locator(
      `a:has-text("Could not find a caseworker with that email address")[href*="#caseworkers"]`,
    )
  }

  async updateInputs() {
    const inputs = this.page.locator('[data-testid="caseWorkerInput"]')
    this.emailAddressInputs = await inputs.count().then(count =>
      Array(count)
        .fill(0)
        .map((_, i) => inputs.nth(i)),
    )
    const removeButtons = this.page.locator('[data-testid="removeCaseWorkerButton"]')
    this.removeCaseWorkerButtons = await removeButtons.count().then(count =>
      Array(count)
        .fill(0)
        .map((_, i) => removeButtons.nth(i)),
    )
  }

  static async verifyOnPage(page: Page): Promise<AssignPage> {
    const assignPage = new AssignPage(page)
    await expect(assignPage.header).toBeVisible()
    await assignPage.updateInputs()
    return assignPage
  }

  static async verifyInvalidEmailOnPage(page: Page): Promise<AssignPage> {
    const assignPage = new AssignPage(page)
    await expect(assignPage.header).toBeVisible()
    await expect(assignPage.errorHeader).toBeVisible()
    await expect(assignPage.invalidEmailMessage).toBeVisible()
    await assignPage.updateInputs()
    return assignPage
  }

  static async verifyBlankEmailOnPage(page: Page): Promise<AssignPage> {
    const assignPage = new AssignPage(page)
    await expect(assignPage.header).toBeVisible()
    await expect(assignPage.errorHeader).toBeVisible()
    await expect(assignPage.blankEmailMessage).toBeVisible()
    await assignPage.updateInputs()
    return assignPage
  }

  static async verifyUnrecognisedEmailOnPage(page: Page): Promise<AssignPage> {
    const assignPage = new AssignPage(page)
    await expect(assignPage.header).toBeVisible()
    await expect(assignPage.errorHeader).toBeVisible()
    await expect(assignPage.unrecognisedEmailMessage).toBeVisible()
    await assignPage.updateInputs()
    return assignPage
  }
}
