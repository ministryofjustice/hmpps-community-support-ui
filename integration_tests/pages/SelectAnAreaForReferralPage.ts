import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class SelectAnAreaForReferralPage extends AbstractPage {
  readonly heading: Locator

  readonly continueButton: Locator

  readonly errorSummary: Locator

  private constructor(page: Page) {
    super(page)
    this.heading = page.getByRole('heading', { level: 1 })
    this.continueButton = page.getByRole('button', { name: 'Continue' })
    this.errorSummary = page.locator('[data-testid="error-messages"]')
  }

  static url(): string {
    return '/referral/task-list/select-an-area-for-referral'
  }

  static async verifyOnPage(page: Page): Promise<SelectAnAreaForReferralPage> {
    const selectAnAreaForReferralPage = new SelectAnAreaForReferralPage(page)
    await expect(selectAnAreaForReferralPage.heading).toBeVisible()
    return selectAnAreaForReferralPage
  }

  radioOption(providerId: string): Locator {
    return this.page.locator(`input[name="selectArea"][value="${providerId}"]`)
  }

  async selectArea(providerId: string): Promise<void> {
    await this.radioOption(providerId).check()
  }
}
