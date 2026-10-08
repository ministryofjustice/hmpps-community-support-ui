import { expect, Locator, Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class ActionPlanCheckServiceEndDatePage extends AbstractPage {
  readonly header: Locator

  readonly continueButton: Locator

  static url(caseReference: string): string {
    return `/referral/${caseReference}/action-plan/service-end-date-check`
  }

  private constructor(page: Page) {
    super(page)
    this.header = page.getByRole('heading', { level: 1 })
    this.continueButton = page.getByRole('button', { name: 'Continue' })
  }

  static async verifyOnPage(page: Page): Promise<ActionPlanCheckServiceEndDatePage> {
    const checkServiceEndDatePage = new ActionPlanCheckServiceEndDatePage(page)
    await expect(checkServiceEndDatePage.header).toBeVisible()
    return checkServiceEndDatePage
  }
}
