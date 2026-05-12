import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class IcsFeedbackSessionFeedbackPage extends AbstractPage {
  readonly header: Locator

  readonly errorHeader: Locator

  readonly backLink: Locator

  readonly whatDidYouDoInput: Locator

  readonly continueButton: Locator

  static url(caseRefId: string): string {
    return `/ics-feedback/${caseRefId}/session-feedback`
  }

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: 'Session feedback' })
    this.errorHeader = page.locator('h2', { hasText: 'There is a problem' })
    this.backLink = page.getByRole('link', { name: 'Back', exact: true })
    this.whatDidYouDoInput = page.locator('textarea[name="whatDidYouDo"]')
    this.continueButton = page.getByRole('button', { name: 'Continue' })
  }

  static async verifyOnPage(page: Page): Promise<IcsFeedbackSessionFeedbackPage> {
    const sessionFeedbackPage = new IcsFeedbackSessionFeedbackPage(page)
    await expect(sessionFeedbackPage.header).toBeVisible()
    await expect(sessionFeedbackPage.whatDidYouDoInput).toBeVisible()
    await expect(sessionFeedbackPage.continueButton).toBeVisible()
    return sessionFeedbackPage
  }

  static async verifyFieldErrorOnPage(
    page: Page,
    fieldName: string,
    expectedInputErrorMessage: string,
  ): Promise<IcsFeedbackSessionFeedbackPage> {
    const errorMessageLocator = page
      .locator(`div.govuk-error-summary:has(a[href*="#${fieldName}"])`)
      .filter({ hasText: expectedInputErrorMessage })
    const fieldErrorMessageLocator = page.locator(`#${fieldName}-error`).filter({ hasText: expectedInputErrorMessage })
    const sessionFeedbackPage = new IcsFeedbackSessionFeedbackPage(page)
    await expect(sessionFeedbackPage.header).toBeVisible()
    await expect(sessionFeedbackPage.errorHeader).toBeVisible()
    await expect(errorMessageLocator).toBeVisible()
    await expect(fieldErrorMessageLocator).toBeVisible()
    await expect(sessionFeedbackPage.continueButton).toBeVisible()
    return sessionFeedbackPage
  }
}
