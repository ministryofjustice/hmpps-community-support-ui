import { expect, Locator, Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class ActionPlanRisksAndAdjustmentsPage extends AbstractPage {
  readonly header: Locator

  readonly continueButton: Locator

  static url(caseReference: string): string {
    return `/referral/${caseReference}/action-plan/risks-and-adjustments`
  }

  private constructor(page: Page) {
    super(page)
    this.header = page.getByRole('heading', { level: 1 })
    this.continueButton = page.getByRole('button', { name: 'Continue' })
  }

  static async verifyOnPage(page: Page): Promise<ActionPlanRisksAndAdjustmentsPage> {
    const risksAndAdjustmentsPage = new ActionPlanRisksAndAdjustmentsPage(page)
    await expect(risksAndAdjustmentsPage.header).toBeVisible()
    return risksAndAdjustmentsPage
  }
}
