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

  public readonly invalidEmailInputErrorMessage: string

  public readonly blankEmailInputErrorMessage: string

  public readonly unrecognisedEmailInputErrorMessage: string

  private constructor(
    page: Page,
    public readonly backLink: Locator,
  ) {
    super(page)
    this.header = page.locator('h1')
    this.errorHeader = page.locator('h2', { hasText: 'There is a problem' })
    this.subheaders = page.locator('legend')
    this.addAnotherCaseWorkerButton = page.locator('[data-testid="addAnotherCaseWorker"]')
    this.removeCaseWorkerButtons = []
    this.emailAddressInputs = []
    this.submitButton = page.getByRole('button', { name: 'Submit' })
    this.invalidEmailInputErrorMessage = 'Enter an email address in the correct format, like name@example.com'
    this.blankEmailInputErrorMessage = "Enter the caseworker's email address"
    this.unrecognisedEmailInputErrorMessage = 'Could not find a caseworker with that email address'
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
    const backLink = page.getByRole('link', { name: 'Back', exact: true })
    const assignPage = new AssignPage(page, backLink)
    await expect(assignPage.header).toBeVisible()
    await assignPage.updateInputs()
    return assignPage
  }

  async verifyInputErrorMessage(inputIndex: number, expectedInputErrorMessage: string): Promise<AssignPage> {
    const errorMessageLocator = this.page
      .locator(`[data-testid="error-messages"] a[href*="#caseworkers\\[${inputIndex}\\]\\[email_address\\]"]`)
      .filter({ hasText: expectedInputErrorMessage })
    const errorInputLocator = this.page
      .locator(`#caseworkers\\[${inputIndex}\\]\\[email_address\\]-error`)
      .filter({ hasText: expectedInputErrorMessage })
    await expect(this.header).toBeVisible()
    await expect(this.errorHeader).toBeVisible()
    await expect(errorMessageLocator).toBeVisible()
    await expect(errorInputLocator).toBeVisible()
    await this.updateInputs()
    return this
  }

  static async verifyInvalidEmailOnPage(page: AssignPage, inputIndex: number = 0): Promise<AssignPage> {
    return page.verifyInputErrorMessage(inputIndex, page.invalidEmailInputErrorMessage)
  }

  static async verifyBlankEmailOnPage(page: AssignPage, inputIndex: number = 0): Promise<AssignPage> {
    return page.verifyInputErrorMessage(inputIndex, page.blankEmailInputErrorMessage)
  }

  static async verifyUnrecognisedEmailOnPage(page: AssignPage, inputIndex: number = 0): Promise<AssignPage> {
    return page.verifyInputErrorMessage(inputIndex, page.unrecognisedEmailInputErrorMessage)
  }
}
