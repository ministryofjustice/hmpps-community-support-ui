import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class IcsFeedbackNextStepsPage extends AbstractPage {
  readonly header: Locator

  readonly errorHeader: Locator

  readonly backLink: Locator

  readonly plannedForNextSessionInput: Locator

  readonly plannedForNextSessionLabel: Locator

  readonly actionsBeforeNextSessionInput: Locator

  readonly actionsBeforeNextSessionLabel: Locator

  readonly continueButton: Locator

  static url(caseRefId: string): string {
    return `/ics-feedback/${caseRefId}/next-steps`
  }

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: 'Next steps' })
    this.errorHeader = page.locator('h2', { hasText: 'There is a problem' })
    this.backLink = page.getByRole('link', { name: 'Back', exact: true })
    this.plannedForNextSessionInput = page.locator('textarea[name="plannedForNextSession"]')
    this.plannedForNextSessionLabel = page.locator('label[for="plannedForNextSession"]', {
      hasText: 'What do you have planned for the next session?',
    })
    this.actionsBeforeNextSessionInput = page.locator('textarea[name="actionsBeforeNextSession"]')
    this.actionsBeforeNextSessionLabel = page.locator('label[for="actionsBeforeNextSession"]', {
      hasText: 'What actions do you and John have before the next session takes place?',
    })
    this.continueButton = page.getByRole('button', { name: 'Continue' })
  }

  static async verifyOnPage(page: Page): Promise<IcsFeedbackNextStepsPage> {
    const nextStepsPage = new IcsFeedbackNextStepsPage(page)
    await expect(nextStepsPage.header).toBeVisible()
    await expect(nextStepsPage.plannedForNextSessionLabel).toBeVisible()
    await expect(nextStepsPage.plannedForNextSessionInput).toBeVisible()
    await expect(nextStepsPage.actionsBeforeNextSessionLabel).toBeVisible()
    await expect(nextStepsPage.actionsBeforeNextSessionInput).toBeVisible()
    await expect(nextStepsPage.continueButton).toBeVisible()
    return nextStepsPage
  }

  static async verifyFieldErrorOnPage(page: Page, fieldName: string, expectedInputErrorMessage: string) {
    const errorMessageLocator = page
      .locator(`div.govuk-error-summary:has(a[href*="#${fieldName}"])`)
      .filter({ hasText: expectedInputErrorMessage })
    const fieldErrorMessageLocator = page.locator(`#${fieldName}-error`).filter({ hasText: expectedInputErrorMessage })
    const nextStepsPage = new IcsFeedbackNextStepsPage(page)
    await expect(nextStepsPage.header).toBeVisible()
    await expect(nextStepsPage.errorHeader).toBeVisible()
    await expect(errorMessageLocator).toBeVisible()
    await expect(fieldErrorMessageLocator).toBeVisible()
    await expect(nextStepsPage.continueButton).toBeVisible()
    return nextStepsPage
  }
}
