import { expect, Locator, Page } from '@playwright/test'
import AbstractPage from './abstractPage'
import ErrorSummary from './components/errorSummary'

export default class WithdrawalReasonPage extends AbstractPage {
  private constructor(
    page: Page,
    readonly header: Locator,
    readonly backLink: Locator,
    readonly errorSummary: ErrorSummary,
    readonly reasonHeadings: Locator,
    readonly reasonRadios: Locator,
    readonly additionalInformation: Locator,
    readonly additionalInformationError: Locator,
    readonly continueButton: Locator,
  ) {
    super(page)
  }

  static url(referralIdentifier: string): string {
    return `/referral/${referralIdentifier}/withdraw`
  }

  static async verifyOnPage(page: Page): Promise<WithdrawalReasonPage> {
    const header = page.getByRole('heading', { level: 1 })
    await expect(header).toBeVisible()
    return new WithdrawalReasonPage(
      page,
      header,
      page.getByRole('link', { name: 'Back', exact: true }),
      await ErrorSummary.create(page.locator('[data-testid="error-messages"]')),
      page.locator('h2.govuk-heading-s'),
      page.locator('input[name="withdrawalReason"]'),
      page.locator('textarea[name="additionalInformation"]'),
      page.locator('.govuk-radios__conditional--visible .govuk-error-message'),
      page.getByRole('button', { name: 'Continue', exact: true }),
    )
  }

  reason(label: string): Locator {
    return this.page.getByLabel(label, { exact: true })
  }

  async additionalInformationFor(reasonLabel: string): Promise<Locator> {
    const reason = this.reason(reasonLabel)
    const reasonValue = await reason.inputValue()
    return reason
      .locator('xpath=../following-sibling::div[contains(@class, "govuk-radios__conditional")][1]')
      .locator(`textarea[name="${reasonValue}Details"]`)
  }

  additionalInformationErrorFor(reasonLabel: string): Locator {
    return this.reason(reasonLabel)
      .locator('xpath=../following-sibling::div[contains(@class, "govuk-radios__conditional")][1]')
      .locator('.govuk-error-message')
  }
}
