import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class AssignPage extends AbstractPage {
  public readonly header: Locator

  public readonly errorHeader: Locator

  public readonly subheaders: Locator

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
    this.subheaders = page.locator('legend')
    this.addAnotherCaseWorkerButton = page.locator('[data-testid="addAnotherCaseWorker"]')
    this.removeCaseWorkerButtons = []
    this.emailAddressInputs = []
    this.submitButton = page.getByRole('button', { name: 'Submit' })
    this.invalidEmailMessage = page
      .locator('[data-testid="error-messages"] a[href*="#caseworkers"]')
      .filter({ hasText: 'Enter an email address in the correct format' })
    this.blankEmailMessage = page
      .locator('[data-testid="error-messages"] a[href*="#caseworkers"]')
      .filter({ hasText: `Enter the caseworker's email address` })
    this.unrecognisedEmailMessage = page
      .locator('[data-testid="error-messages"] a[href*="#caseworkers"]')
      .filter({ hasText: 'Could not find a caseworker with that email address' })
  }

  async updateInputs() {
    const inputs = this.page.locator('[data-testid="caseWorkerInput"]:visible')
    this.emailAddressInputs = await inputs.count().then(count =>
      Array(count)
        .fill(0)
        .map((_, i) => inputs.nth(i)),
    )
    const removeButtons = this.page.locator(
      '[data-testid="removeCaseWorkerButton"]:not(.govuk-visually-hidden):visible',
    )
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
